const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/create/ludiquiz/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('useSearchParams')) {
  code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useSearchParams } from 'next/navigation';\nimport { getActivityForEdit } from '@/app/actions/getActivityForEdit';");
}

const contextHookLine = 'const { state, setActivityType, setQuestions } = useActivityEditor();';
if (code.includes(contextHookLine)) {
  const replacement = `const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    
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
                    
                    if (result.data.questions && result.data.questions.length > 0) {
                        setLocalQuestions(result.data.questions as LudiQuizQuestion[]);
                        // Set the next question ID
                        const maxId = Math.max(...result.data.questions.map(q => q.id));
                        setQuestionId(maxId + 1);
                        setNewQuestion(prev => ({ ...prev, id: maxId + 1 }));
                    }
                }
                setIsLoading(false);
            }
        };
        loadActivity();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage]);`;
    
  code = code.replace(contextHookLine, replacement);
  
  // Also we need to render a loading state or just let it load in the background
}

fs.writeFileSync(filePath, code);
