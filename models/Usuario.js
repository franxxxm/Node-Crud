const db = require("./bd")

const Usuario = db.sequelize.define('usuario',{
    nome:{
        type:db.Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:db.Sequelize.STRING,
        allowNull:false
    }
})

Usuario.sync()

module.exports = Usuario