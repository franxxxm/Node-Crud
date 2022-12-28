const Sequelize = require("sequelize");
const sequelize = new Sequelize('crud','root','',{
    host:'127.0.0.1',
    dialect:'mysql',
    define:{
        charset:'utf8',
        callate: 'utf8_general_ci',
        timestamps: true
    }, 
    logging:false
})
/*
sequelize.authenticate().then(()=>{
    console.log("conectado com sucesso")
}).catch((erro)=>{
    console.log("erro ao conectar "+ erro)
})
*/
module.exports = {Sequelize, sequelize}




