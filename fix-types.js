const fs = require('fs');
const path = require('path');

function fixLudiQuiz() {
    const filePath = path.join(__dirname, 'src/app/create/ludiquiz/page.tsx');
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace("const questions = result.data.questions;", "const questions = result.data.questions as LudiQuizQuestion[];");
    fs.writeFileSync(filePath, code);
}

function fixTrueOrFalse() {
    const filePath = path.join(__dirname, 'src/app/create/trueorfalse/page.tsx');
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace("const questions = result.data.questions;", "const questions = result.data.questions as TrueOrFalseQuestion[];");
    fs.writeFileSync(filePath, code);
}

fixLudiQuiz();
fixTrueOrFalse();
