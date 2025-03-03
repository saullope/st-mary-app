// path: src/app/create/ludiquiz/page.tsx

export default function LudiQuiz() {
    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif', 
            maxWidth: '800px', 
            margin: '0 auto', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '8px', 
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px' 
        }}>
            {/* Sección de tipo de pregunta */}
            <div style={{ 
                padding: '20px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                backgroundColor: '#fff', 
                alignSelf: 'flex-end', 
                width: '50%' 
            }}>
                <h3 style={{ marginBottom: '10px', fontSize: '20px', color: '#333' }}>Tipo de pregunta</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="questionType" value="quiz" />
                        Quiz
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="questionType" value="timeLimit" />
                        Límite de tiempo: 20 segundos
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="questionType" value="points" />
                        Puntos: Estándar
                    </label>
                </div>
            </div>

            {/* Sección de opciones de respuesta */}
            <div style={{ 
                padding: '20px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                backgroundColor: '#fff', 
                alignSelf: 'flex-end', 
                width: '50%' 
            }}>
                <h3 style={{ marginBottom: '10px', fontSize: '20px', color: '#333' }}>Opciones de respuesta</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="answerType" value="singleSelect" />
                        Selección única
                    </label>
                    <button
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: 'fit-content',
                        }}
                    >
                        Eliminar
                    </button>
                    <button
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: 'fit-content',
                        }}
                    >
                        Duplicar
                    </button>
                </div>
            </div>

            {/* Sección de respuestas */}
            <div style={{ 
                padding: '20px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                backgroundColor: '#fff', 
                alignSelf: 'flex-end', 
                width: '50%' 
            }}>
                <h3 style={{ marginBottom: '10px', fontSize: '20px', color: '#333' }}>Respuestas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            fontSize: '16px',
                        }}
                        placeholder="Añadir respuesta 1"
                    />
                    <input
                        type="text"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            fontSize: '16px',
                        }}
                        placeholder="Añadir respuesta 2"
                    />
                    <input
                        type="text"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            fontSize: '16px',
                        }}
                        placeholder="Añadir respuesta 3 (opcional)"
                    />
                    <input
                        type="text"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            fontSize: '16px',
                        }}
                        placeholder="Añadir respuesta 4 (opcional)"
                    />
                </div>
            </div>
        </div>
    );
}