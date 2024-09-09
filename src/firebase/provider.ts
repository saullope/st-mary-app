import { 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    sendEmailVerification, 
    signInWithEmailAndPassword, 
    signInWithPopup,
    updateProfile } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

interface RegisterResponse {
    ok: boolean;
    displayName?: string;
    email?: string;
    photoURL?: string;
    uid?: string;
    error?: string;
    errorMessage?: string;
};

interface UserData {
    email: string;
    password: string;
    displayName?: string;
};


// iniciar session con cuenta de google
// seusa el redireccionamiento para obtener el token de acceso
export const signInWithGoogle = async (): Promise<RegisterResponse> => {
    try {

        let UserCredential: any;

        await signInWithPopup(auth, googleProvider);
        const unsuscribe = onAuthStateChanged(auth, (user) => {
            if(user){
                UserCredential = user;
            }
        });


        
         const { displayName, email, photoURL, uid } = UserCredential;


    return {
        ok: true,
        displayName: displayName || '',
        email: email || '',
        photoURL: photoURL || '',
        uid: uid || ''
    }
        

    }catch(error: any){
        const errorCode = error.code;
        const errorMessage = error.messages;

        return {
            ok: false,
            error: errorCode,
            errorMessage: errorMessage
        }
    }
}

// registrar un usuario con email y contraseña
export const registerUserWithEmailPassword = async ({email, password,displayName} : UserData) : Promise<RegisterResponse> => {

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await sendEmailVerification(user);
       
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName });
        }

        const { uid, photoURL } = user;

        return {
            ok: true,
            uid: uid || '',
            photoURL: photoURL || '',
            email: email || '',
            displayName: displayName || '' 
        }

    } catch(error : any){
        return {
            ok: false,
            errorMessage: error.message
        }
    }
}

// iniciar sesión con email y contraseña
export const LoginWithEmailPassword = async ({ email, password }: UserData): Promise<RegisterResponse> => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const { uid, photoURL, displayName } = user;
        return {
            ok: true,
            uid: uid || '',
            photoURL: photoURL || '',
            email: email || '',
            displayName: displayName || ''
        }
    } catch (error: any) {
        return {
            ok: false,
            errorMessage: error.message
        }
    }
}

// cerrar sesión del usuario
export const logoutFirebase = async () => {
    return await auth.signOut();
}