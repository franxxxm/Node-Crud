const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const hbs = require("express-handlebars");

//tabela usuario
const Usuario = require("./models/Usuario")

//CONFIGURANDO HANDLEBARS
app.engine("hbs", hbs.engine({
    extname:'hbs',
    defaultLayout:'main'
}));
app.set("view engine", 'hbs');

//config bodtparser
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));


//config de session
app.use(session({
    secret:'qualquercoisaae',
    resave: false,
    saveUninitialized:true
}))


app.get("/", (req, res)=>{
    if(req.session.error){
        req.session.error = false;
        var mensagem = req.session.mensagem;
        return res.render("index", {navCad:true, error:mensagem});
    }
    if(req.session.success){
        req.session.success = false;
        var mensagem = req.session.mensagem;
        return res.render("index", {navCad:true, success:mensagem});
    }

    res.render("index", {navCad:true, sucessos:mensagem});
})
app.post("/cad", (req, res)=>{
    //recebendo dados do formulario
    const novoUser = {
        nome:req.body.nome,
        email:req.body.email.toLowerCase()
    }

    //criando array de erros 
    const erros = []

    Usuario.findAll({where:{email:novoUser.email}}).then((dados)=>{
       if(dados.length > 0){
            erros.push({mensagem:'Esse email já está registado'});
            req.session.error = true;
            req.session.mensagem = erros;
            return res.redirect('/');
        
       }

        for (const key in novoUser) {
            //Tirar os espaços
            novoUser[key] = novoUser[key].trim();
            //Verificadno se o campo email e nome está vazio, undefine ou null
            if(novoUser[key] == '' || typeof novoUser[key] == undefined || novoUser[key] == null){
                erros.push({mensagem:'O Campo '+ key + ' está vazio'})
            }
            //Removendo caracteres especiais
            novoUser.nome = novoUser.nome.replace(/[^A-zÀ-ú\s]/gi,'')
            novoUser.nome = novoUser.nome.trim();
            }   
            //regex nom
            if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(novoUser.nome)){
                erros.push({mensagem:"NOME INVALIDO!!"}) 
            }
            //regex email
            if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(novoUser.email)){
                erros.push({mensagem:"EMAIL INVALIDO!!!"})
            }
        //verificadno se tem erros
        if(erros.length > 0){
            req.session.error = true;
            req.session.mensagem = erros;
            return res.redirect('/');
        }
        //cadastando no banco de dados
        Usuario.create(novoUser).then(()=>{
            const sucesso = [{mensagem:'Cadastrado com sucesso'}]
            req.session.success = true;
            req.session.mensagem = sucesso;
            return res.redirect("/") 
        }).catch((erro)=>{
            erros.push({mensagem:'Ocorreu um erro ao cadastrar seus dados, tente novamente mais tarde'})
            req.session.error = true;
            req.session.mensagem = erros;
            return res.redirect('/');
        })

    })
      
})


app.get("/user", (req, res)=>{
    Usuario.findAll().then((dados)=>{

        if(dados.length > 0){
            return res.render("user", {navUser:true, table:true, usuario:dados.map(dados => dados.toJSON())});
        }else{
            return res.render("user", {navUser:true, table:false})
        }

    })
})

app.post("/editar", (req, res)=>{
    var id = req.body.id

    Usuario.findByPk(id).then((dados)=>{
        console.log(dados)
       return res.render("editar",{erro:true, id:dados.id, nome:dados.nome, email:dados.email})
    }).catch((erro)=>{
        return res.render("editar",{erro:false})
    })
})

app.post("/update", (req, res)=>{
    //recebendo dados do formulario
    const novoUser = {
        nome:req.body.nome,
        email:req.body.email.toLowerCase()
    }
    //criando array de erros 
    const erros = []
    var pass = true;
    for (const key in novoUser) {
        //Tirar os espaços
        novoUser[key] = novoUser[key].trim();
        //Verificadno se o campo email e nome está vazio, undefine ou null
        if(novoUser[key] == '' || typeof novoUser[key] == undefined || novoUser[key] == null){
            erros.push({mensagem:'O Campo '+ key + ' está vazio'})
        }
        //Removendo caracteres especiais
        novoUser.nome = novoUser.nome.replace(/[^A-zÀ-ú\s]/gi,'')
        novoUser.nome = novoUser.nome.trim();
    }
        //regex nom
        if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(novoUser.nome)){
            erros.push({mensagem:"NOME INVALIDO!!"}) 
        }
        //regex email
        if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(novoUser.email)){
            erros.push({mensagem:"EMAIL INVALIDO!!!"})
        }
    
    if(erros.length > 0){
        return res.status(400).send({status:400, erro:erros})
    }

    Usuario.update({
        nome:novoUser.nome,
        email:novoUser.email
    },
    {where:{id:req.body.id}}).then(()=>{
        return res.redirect("/user")
    }).catch((erro)=>{
        return res.redirect("/")
    })

})

app.post("/delet", (req, res)=>{
    Usuario.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.redirect("/user")
    }).catch(()=>{
        return res.redirect("/")
    })
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("http://localhost:"+PORT);
})