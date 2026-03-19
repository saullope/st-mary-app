const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/create/ludiquiz/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// remove everything from `const searchParams` to `loadActivity();`
const loadActivityEffectRegex = /const searchParams = useSearchParams\(\);[\s\S]*?loadActivity\(\);\n    \}, \[.*?\]\);/;
const match = code.match(loadActivityEffectRegex);
if(match) {
    code = code.replace(match[0], '');
}

const contextRegex = /const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor\(\);/;

code = code.replace(contextRegex, `${contextRegex.source.replace(/\/g, '')}
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);`);

const syncRegex = /\/\/ --- Sincronizar preguntas locales con el contexto global ---/;
const loadEffect = `
    // --- Cargar actividad para editar ---
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
                        const questions = result.data.questions as LudiQuizQuestion[];
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
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage, setLocalQuestions, setQuestionId, setNewQuestion]);

`;

code = code.replace(syncRegex, `${loadEffect}${syncRegex.source.replace(/\/g, '')}`);

fs.writeFileSync(filePath, code);

