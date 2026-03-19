const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/create/trueorfalse/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('useSearchParams')) {
  code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useSearchParams } from 'next/navigation';\nimport { getActivityForEdit } from '@/app/actions/getActivityForEdit';");
}

const contextHookLine = 'const { state, setActivityType, setQuestions } = useActivityEditor();';
if (code.includes(contextHookLine)) {
  const replacement = `const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);`;
    
  code = code.replace(contextHookLine, replacement);
}

const syncLine = '// --- Sincronización en tiempo real con el contexto ---';
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
                    
                    if (result.data.questions && result.data.questions.length > 0) {
                        const questions = result.data.questions;
                        setLocalQuestions(questions);
                        const maxId = Math.max(...questions.map(q => q.id));
                        setQuestionId(maxId + 1);
                        setNewQuestion(prev => ({ ...prev, id: maxId + 1 }));
                    }
                }
                setIsLoading(false);
            }
        };
        loadActivity();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage]);
`;

if (code.includes(syncLine)) {
  code = code.replace(syncLine, loadCode + '\n    ' + syncLine);
}

fs.writeFileSync(filePath, code);

