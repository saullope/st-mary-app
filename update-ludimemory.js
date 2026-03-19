const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/create/ludimemory/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('useSearchParams')) {
  code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useSearchParams } from 'next/navigation';\nimport { getActivityForEdit } from '@/app/actions/getActivityForEdit';");
}

const contextHookLine = 'const { state, setActivityType, setMemoryImages } = useActivityEditor();';
if (code.includes(contextHookLine)) {
  const replacement = `const { state, setActivityType, setMemoryImages, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);`;
    
  code = code.replace(contextHookLine, replacement);
}

const syncLine = 'const [showUnsplash, setShowUnsplash] = useState(false);';
const loadCode = `
    useEffect(() => {
        const loadActivity = async () => {
            const idParam = searchParams.get("id");
            if (idParam) {
                setIsLoading(true);
                const result = await getActivityForEdit(parseInt(idParam));
                if (result.success && result.data) {
                    setActivityId(result.data.activityId);
                    setTitle(result.data.title);
                    updateConfig(result.data.config);
                    setBackgroundImage(result.data.backgroundImage);
                    
                    if (result.data.memoryImages && result.data.memoryImages.length > 0) {
                        setMemoryImages(result.data.memoryImages);
                    }
                }
                setIsLoading(false);
            }
        };
        loadActivity();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage, setMemoryImages]);
`;

if (code.includes(syncLine)) {
  code = code.replace(syncLine, syncLine + '\n' + loadCode);
}

fs.writeFileSync(filePath, code);

