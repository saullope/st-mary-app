'use client'

import { useState } from 'react';
import styles from './LoadImagesComponent.module.css';

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
      <div className={styles.mediaSelector}>
        <div
          className={styles.mediaPlaceholder}
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
              className={styles.mediaFloatMenu}
              id="media-float-menu"
            >
              <button className={styles.smallBtn} id="upload-btn" type="button"
              onClick={() => handleSelectImage()}
              >
                {uploadFileTranslation}
              </button>
              <button className={styles.smallBtn} id="unsplash-btn" type="button"
              onClick={() => handleOpenModal()}
              >
               {searchUnsplashTraslation}
              </button>
             {space != "memory" && (<button className={styles.smallBtn} id="youtube-btn" type="button"
              >
                {searchYoutubeTraslation}
              </button>)}
            </div>
          )
        }
      </div>
  );
};