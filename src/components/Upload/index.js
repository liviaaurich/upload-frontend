import React, { Component } from 'react';

import Dropzone from 'react-dropzone';

import { DropContainer, UploadMessage } from './styles';

// import { Container } from './styles';

export default class Upload extends Component {
  
  renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) {
      return <UploadMessage>Arraste arquivos aqui ...</UploadMessage>;
    }

    if (isDragReject) {
      return <UploadMessage type="error">Arquivo não suportado</UploadMessage>;
    }
    
    return <UploadMessage type="success">Solte os arquivos aqui</UploadMessage>;
  };

  render() {
    const { onUpload } = this.props;
    
    return (
      <Dropzone accept="image/*" onDropAccepted={onUpload}>
        { ({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
          <DropContainer 
            {...getRootProps()}
            isDragActive={isDragActive} //Simboliza quando o usuário está com o mouse passando por cima dessa zone
            isDragReject={isDragReject} //Quando o usuario esta passando um arquivo que nao é imagem
          >
            <input {...getInputProps()} />
            {this.renderDragMessage(isDragActive, isDragReject)}
          </DropContainer>
        ) }
      </Dropzone>  
    );
  }
}