const admin = require("firebase-admin");

// Carregar variáveis do .env manualmente para o script de node puro
const projectId = "vila-guaracy";
const clientEmail = "firebase-adminsdk-fbsvc@vila-guaracy.iam.gserviceaccount.com";
const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGOnjTUhHK7BCy\n4zA2477+UCMTrq7orPflg7zlYwF0zWo4Gr083gPmYA8s7u3BZeIuxyiyROq84Yt0\n3xuD3nSWo4AJ/cHS1wJGHGKnJixpPn66hunOyRPSr1VZvU9/AwFDtGC6FS/SZT+p\nRdI3kmpTl5CE4nhvnezw7Ca7PnNCSYhEjPZ2NJCAFinjM49HBnhg5WErK1s+/ZDB\nDtA4Bc0O485x6kTA4tRihvTcFwnVjaGLmOk6QR82BGseP8nyE1lUQPyMe1305OLR\n1XlTplqqlPbO9/7DZGr1OBdv3IJK682GiP/158zH2S7cP18zGI4mKATDYWg+rGfK\nzUadZRqBAgMBAAECggEAAsrjlVyIXiK1uINtVDSgpe4ElHwnQCVhp6TTtiqPJHFZ\nX/l2dYNOLEJprFEgXdNc3JpXJy3D3c3SnF6hQVoSq+WZQerGfn0jbc/sDt1BjmkA\nOYn5hL197z+jlOxPEKO+8pB5tV1ji1P8UdrnM3u3Tj6qHUkgd7gSlLFK+WPPlV0z\n+mO9d62G/CyDoGWjuRMeeaaCIrBAnzalM1krfyxU5PDqK3J++UlRLsxjr9F2epJ4\n3kqRAhsz1jGr3KdglOAKzLmiXEfMin808kbMrEb6thvhhH1E6rwp6GxsAkUrvTvV\nyaabtbZRsqYQ70r9/XOMOf3ojzRbkvMJ2AY4HXwPXQKBgQDlSIkOo50v1SGZkk49\nihAjd7BBvUYwTpGs3CFl0tkkCBCDKIM8lZnGw/8L9Ej81R7hUiLlzvDjLvtmLwiN\n+CnWkJov7tU/IoX7UhcprbaPfyhAafu6OAHiUs9EncS8CZALW0JKW2gYZvmA1WXh\nELS2LmQQ53c2LgbhR33o4pljBQKBgQDdU5Nec9T1Tdu7qnQEP3eH7OLUXr6/XQqo\nWY9kD65FRLZJl4zDmi/Cg2gYilHQ0mrirEYHq06WLDBO8p2OHsGaZc9lsuLTP/d+\ne7lVhOXiTFODnl9aPZXKiKtjyRnIOQT2pgCGyvIbrLTREpXB8f5yrgpeKkURDX74\nqochXU2qTQKBgQDYUHSuEQKNTCDlCDk0qfrL23G4s99yV83sLcp8jE48Rjd95kza\nbbGk6ujG2HO7xT3bCmjOM0zkqUCZiSoi9sxSGB6/ti4N4H5TO4GK2s7v1uGc0+Cg\nMZLleYb+j3I6jTMO48xI5q/wxcYDHFF/4wj7EA1sPVQlE4t+IrrRameYGQKBgAWJ\n2d47N9ELqbwAf/a7P9p+6w41cMCJK4Ma+qOeYNYK6iTdTgB3E0rizvAORg3btiEF\n/pqihszrPio7mAW+b0nV0mLRHyv6Jc9ceT7SnI4VKuHYTLqNX/o5gVB179c61gz2\nCn1VBsn6gGva8zRvQdbM1CWXGTNcCxld6xPCqfbhAoGBAOSp25S8OeG9d5jPHsrB\n4dgKKp217Rgwxg9NPKny83u+EF5G9gr0fzNjaI4cgWcThWxdb2c+7gbbI/eASXSr\nwLC19QNYeW2kDq2b3wzk7cElFCLF0EDFGDvzQDSphu9sZqEYjr1qOxlXB0XtCscZ\nuiMUM0IeBXc+kLxoycL+4f/s\n-----END PRIVATE KEY-----\n".replace(/\\n/g, "\n");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
    })
});

const auth = admin.auth();
const db = admin.firestore();

async function createDiretora() {
    const email = "diretora@vilaguaracy.com.br";
    const password = "Vila@123";
    const name = "Diretora";

    try {
        console.log(`Criando usuário Auth para ${email}...`);
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
            console.log("Usuário já existe no Auth. Atualizando senha...");
            await auth.updateUser(userRecord.uid, { password });
        } catch (e) {
            userRecord = await auth.createUser({
                email,
                password,
                displayName: name
            });
            console.log("Usuário criado com sucesso no Auth.");
        }

        console.log(`Configurando perfil no Firestore para ${userRecord.uid}...`);
        await db.collection("users").doc(userRecord.uid).set({
            name: name,
            email: email,
            role: "gestao",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log("Perfil configurado com sucesso! Login: 'Diretora', Senha: 'Vila@123'");
        process.exit(0);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        process.exit(1);
    }
}

createDiretora();
