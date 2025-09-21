// path: /src/editor-components/ImagePreview.tsx

import uploadImageStyle from '../../../public/css/true-or-false.module.css';
import Image from 'next/image';

interface ImagePreviewProps {
    selectedImages: string[],
    onDeleteImage: (index: number) => void
}

export const Imagepreview = ({selectedImages, onDeleteImage}: ImagePreviewProps) => {
    return (
        <div className={uploadImageStyle['image-preview-container']}>
            {selectedImages.map((image, index) => (
                <div key={index} className={uploadImageStyle['image-preview']}>
                    <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        width={150}
                        height={150}
                        className={uploadImageStyle['preview-img']}
                    />
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