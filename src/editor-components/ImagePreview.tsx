// path: /src/editor-components/ImagePreview.tsx

import uploadImageStyle from '../../public/css/true-or-false.module.css';

interface ImagePreviewProps {
    selectedImages: string[],
    onDeleteImage: (index: number) => void
}

export const Imagepreview = ({selectedImages, onDeleteImage}: ImagePreviewProps) => {
    return (
        <div className={uploadImageStyle['image-preview-container']}>
            {selectedImages.map((image, index) => (
                <div key={index} className={uploadImageStyle['image-preview']}>
                    <img src={image} alt={`Image ${index + 1}`}/>
                    <button
                        className={uploadImageStyle['delete-button']}
                        onClick={() => onDeleteImage(index)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}