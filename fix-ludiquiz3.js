const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/create/ludiquiz/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const regexToRemove = /const searchParams = useSearchParams\(\);[\s\S]*?loadActivity\(\);\n    \}, \[.*?\]\);/;
code = code.replace(regexToRemove, "");

const contextLine = 'const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();';
code = code.replace(contextLine, contextLine + '\n    const searchParams = useSearchParams();\n    const [isLoading, setIsLoading] = useState(false);');

const syncLine = '// --- Sincronizar preguntas locales con el contexto global ---';
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

code = code.replace(syncLine, loadCode + '\n    ' + syncLine);

fs.writeFileSync(filePath, code);

