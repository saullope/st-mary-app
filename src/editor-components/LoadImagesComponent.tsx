import { useState } from 'react';
import uploadImageStyle from '../../public/css/true-or-false.module.css';

interface loadMediaComponentProps {
  space: string,
  handleOpenModal: () => void,
  handleSelectImage: () => void,
  addFileTraslation: string,
  searchUnsplashTraslation: string,
  searchYoutubeTraslation: string,
  uploadFileTranslation: string
}

export const LoadImagesComponent = ({space, handleOpenModal, handleSelectImage, addFileTraslation, searchUnsplashTraslation, searchYoutubeTraslation, uploadFileTranslation}: loadMediaComponentProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  const handleMediaClick = () => {
    setMenuVisible(!menuVisible);
  };

  return (
      <div className={uploadImageStyle['media-selector']}>
        <div
          className={uploadImageStyle['media-placeholder']}
          id="media-placeholder"
          onClick={handleMediaClick}
        >
          <span>+</span>
          <p id="media-text">{addFileTraslation}</p>
          <div id="media-preview"></div>
        </div>
        {
          menuVisible && (
            <div
              id="media-float-menu" style={{padding: "8px"}}
            >
              <button className={`btn ${uploadImageStyle['small-btn']}`} id="upload-btn" type="button"
              onClick={() => handleSelectImage()}
              >
                {uploadFileTranslation}
              </button>
              <button className={`btn ${uploadImageStyle['small-btn']}`} id="unsplash-btn" type="button"
              onClick={() => handleOpenModal()}
              >
               {searchUnsplashTraslation}
              </button>
             {space != "memory" && (<button className={`btn ${uploadImageStyle['small-btn']}`} id="youtube-btn" type="button"
              >
                {searchYoutubeTraslation}
              </button>)}
            </div>
          )
        }
      </div>
  );
};