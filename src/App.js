import React, { Component } from 'react';
import { uniqueId } from 'lodash';
import filesize from 'filesize';

import api from './services/api';

import GlobalStyle from './styles/global';
import { Container, Content } from './styles';

import Upload from './components/Upload'
import FileList from './components/FileList'

class App extends Component {
  state = {
    uploadedFiles: [], //Armazena as informações dos arquivos que o usuário fez upload
  };
  
  async componentDidMount() { //Para recarregar toda a lista de posts da minha api
    const response = await api.get("posts");

    this.setState({ //As informações que exibo são diferentes da que tenho na api
      uploadedFiles: response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }))
    });
  }

  handleUpload = files => { //Preencho o estado do uploadFile independente se deu erro ou não
    const uploadedFiles = files.map(file => ({ // Recebo cada file e produzo um objeto
      file, 
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview:URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }))

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles) //Assim ele não sobrepõe o estado e sim adiciona mais informações
    })

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => { //Atualizo o arquivo, o progresso dele
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map(uploadedFile => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      })
    });
  };

  processUpload = (uploadedFile) => { //Envio os arquivos para o back-end e pego posso medir o progresso
    const data = new FormData(); //Objeto que o html transforma nosso campos do formulário dentro do JS
    
    data.append('file', uploadedFile.file, uploadedFile.name);

    api.post('posts', data, {
      onUploadProgress: e => {
        const progress = parseInt(Math.round((e.loaded * 100) / e.total));

        this.updateFile(uploadedFile.id, {
          progress
        });
      }
    }).then(response => {
      this.updateFile(uploadedFile.id, {
        uploaded: true,
        id: response.data._id,
        url: response.data.url
      });
    }).catch(() => {
      this.updateFile(uploadedFile.id, {
        error: true
      });
    });
  }

  handleDelete = async id => { // Deleta e atualiza a lista de arquivos 
    await api.delete(`posts/${id}`);

    this.setState({
      uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== id)
    });
  }

  componentWillUnmount() { //Fechar a aplicação exclui as imagens em cash
    //Deleta todos os objectsUrl que a gente criou anteriormente para não sobra mais nenhum cash de imagem
    this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }

  render() {
    const { uploadedFiles } = this.state;

    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          { !!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete}/>
          ) }
        </Content>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;
