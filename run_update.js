const fs = require('fs');

function updateLudiQuiz() {
    let file = fs.readFileSync('src/app/create/ludiquiz/page.tsx', 'utf8');

    // 1. Add saveStatus state
    file = file.replace(
        /const \[questionText, setQuestionText\] = useState\(""\);/g,
        "const [questionText, setQuestionText] = useState(\"\");\n    \n    // Estado visual de guardado\n    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');"
    );

    // 2. Add saveStatus logic in useEffect
    file = file.replace(
        /setQuestions\(questionsToSave\);\n    \}, \[localQuestions, newQuestion, questionText, editingId, setQuestions\]\);/g,
        "setQuestions(questionsToSave);\n\n        // --- Actualizar estado visual de guardado ---\n        if (questionsToSave.length === 0) {\n            setSaveStatus('idle');\n            return;\n        }\n\n        setSaveStatus('saving');\n        const timeoutId = setTimeout(() => {\n            setSaveStatus('saved');\n        }, 800);\n        return () => clearTimeout(timeoutId);\n\n    }, [localQuestions, newQuestion, questionText, editingId, setQuestions]);"
    );

    // 3. Add indicator to UI
    file = file.replace(
        /<h1 className=\{style2\.acth1\} style=\{\{\s*fontFamily: 'Comic Sans MS, cursive',\s*fontSize: '2\.5rem',\s*fontWeight: 'bold',\s*textShadow: '2px 2px 4px rgba\(0,0,0,0\.3\)',\s*color: '#ffffff', \/\/ Cambiado a blanco para contraste con fondo oscuro\s*marginBottom: '2rem'\s*\}\}>LudiQuiz<\/h1>/g,
        `<div className="d-flex flex-column align-items-center mb-4 position-relative w-100">\n                                <h1 className={style2.acth1} style={{ \n                                    fontFamily: 'Comic Sans MS, cursive',\n                                    fontSize: '2.5rem',\n                                    fontWeight: 'bold',\n                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',\n                                    color: '#ffffff', // Cambiado a blanco para contraste con fondo oscuro\n                                    marginBottom: '0.5rem'\n                                }}>LudiQuiz</h1>\n                                \n                                {/* Indicador de autoguardado */}\n                                <div style={{\n                                    height: '24px',\n                                    display: 'flex',\n                                    alignItems: 'center',\n                                    justifyContent: 'center',\n                                    opacity: saveStatus === 'idle' ? 0 : 1,\n                                    transition: 'opacity 0.3s ease',\n                                    background: 'rgba(0, 0, 0, 0.4)',\n                                    padding: '4px 12px',\n                                    borderRadius: '12px',\n                                    color: '#e2e8f0',\n                                    fontSize: '0.8rem',\n                                    backdropFilter: 'blur(2px)',\n                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'\n                                }}>\n                                    {saveStatus === 'saving' ? (\n                                        <>\n                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem', borderWidth: '0.15em' }}></span>\n                                            Guardando...\n                                        </>\n                                    ) : (\n                                        <>\n                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="me-1">\n                                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>\n                                            </svg>\n                                            Borrador guardado\n                                        </>\n                                    )}\n                                </div>\n                            </div>`
    );

    fs.writeFileSync('src/app/create/ludiquiz/page.tsx', file);
    console.log("LudiQuiz updated.");
}

function updateTrueOrFalse() {
    let file = fs.readFileSync('src/app/create/trueorfalse/page.tsx', 'utf8');

    // 1. Add saveStatus state
    file = file.replace(
        /const \[editingId, setEditingId\] = useState<number \| null>\(null\);/g,
        "const [editingId, setEditingId] = useState<number | null>(null);\n    \n    // Estado visual de guardado\n    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');"
    );

    // 2. Add saveStatus logic in useEffect
    file = file.replace(
        /setQuestions\(questionsToSave\);\n    \}, \[localQuestions, newQuestion, editingId, setQuestions\]\);/g,
        "setQuestions(questionsToSave);\n\n        // --- Actualizar estado visual de guardado ---\n        if (questionsToSave.length === 0) {\n            setSaveStatus('idle');\n            return;\n        }\n\n        setSaveStatus('saving');\n        const timeoutId = setTimeout(() => {\n            setSaveStatus('saved');\n        }, 800);\n        return () => clearTimeout(timeoutId);\n\n    }, [localQuestions, newQuestion, editingId, setQuestions]);"
    );

    // 3. Add indicator to UI
    file = file.replace(
        /<h1 className=\{style2\.acth1\} style=\{\{\s*fontFamily: 'Comic Sans MS, cursive',\s*fontSize: '2\.5rem',\s*fontWeight: 'bold',\s*textShadow: '2px 2px 4px rgba\(0,0,0,0\.3\)',\s*color: '#ffffff',\s*marginBottom: '2rem'\s*\}\}>Verdadero o Falso<\/h1>/g,
        `<div className="d-flex flex-column align-items-center mb-4 position-relative w-100">\n                                <h1 className={style2.acth1} style={{ \n                                    fontFamily: 'Comic Sans MS, cursive',\n                                    fontSize: '2.5rem',\n                                    fontWeight: 'bold',\n                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',\n                                    color: '#ffffff',\n                                    marginBottom: '0.5rem'\n                                }}>Verdadero o Falso</h1>\n                                \n                                {/* Indicador de autoguardado */}\n                                <div style={{\n                                    height: '24px',\n                                    display: 'flex',\n                                    alignItems: 'center',\n                                    justifyContent: 'center',\n                                    opacity: saveStatus === 'idle' ? 0 : 1,\n                                    transition: 'opacity 0.3s ease',\n                                    background: 'rgba(0, 0, 0, 0.4)',\n                                    padding: '4px 12px',\n                                    borderRadius: '12px',\n                                    color: '#e2e8f0',\n                                    fontSize: '0.8rem',\n                                    backdropFilter: 'blur(2px)',\n                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'\n                                }}>\n                                    {saveStatus === 'saving' ? (\n                                        <>\n                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem', borderWidth: '0.15em' }}></span>\n                                            Guardando...\n                                        </>\n                                    ) : (\n                                        <>\n                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="me
