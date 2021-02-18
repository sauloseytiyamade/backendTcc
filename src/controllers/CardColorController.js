const database = require('../utils/database')
const moment = require('moment')
const jwt = require('jsonwebtoken')

module.exports = {
    Index(req, res){
        //Exibe todos os registros da tabela
        database.select().table('cardcolor').then(color => {
            res.status(200).send({color})
        }).catch(err => {
            res.status(400).send(err)
        })
    },

    Show(req, res){
        const {id} = req.params
        //Exibe um registro com um id específico
        database.select().where({id}).table('cardcolor').then(color => {
            res.status(200).send({color})
        }).catch(err => {
            res.status(400).send(err)
        })
    },

    Create(req, res){
        const body = req.body
        body['created_at'] = moment().format('YYYY-MM-DD HH:mm:ss')
        body['updated_at'] = moment().format('YYYY-MM-DD HH:mm:ss')

        const authorizationCode = req.headers.authorization
        const token = authorizationCode.split(' ')[1]
        const user = jwt.decode(token)

        //Verifica se tem permissão de administrador
        if(user.permission == 0){
            database.select('color').where({color: body.color}).table('cardcolor').then(color =>{
                //Verifica se existe algum registro com este nome
                if(color.length == 0){
                    //Caso não exista cria o registro
                    database.insert(body).into('cardcolor').then(color => {
                         //Grava log
                        const objLog = {
                            user: user.mail,
                            logType: 'Create',
                            lineTableId: parseInt(color[0]),
                            tableName: 'cardColor',
                            lastValue: JSON.stringify(body),
                            dateTime: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        database.insert(objLog).into('logs').then()
                        res.status(201).send({message: 'color created', id: color[0]})
                    }).catch(err => {
                        res.status(400).send(err)
                    })
                }else{
                    //Caso exista apresenta que o registro já existe
                    res.status(409).send({message: 'color exist'})                
                }
            }).catch(err => {
                res.status(400).send(err)
            })
        }else{
            //Caso não tenha permissão de adminsitrador é enviada a mensagem de não autorizado
            res.status(401).send({message: 'Unauthorized'})
        }
    },

    Update(req, res){
        const {id} = req.params
        const body = req.body
        const authorizationCode = req.headers.authorization
        const token = authorizationCode.split(' ')[1]
        const user = jwt.decode(token)

        //Verifica se tem permissão de administrador
        if(user.permission == 0){
            body['updated_at'] = moment().format('YYYY-MM-DD HH:mm:ss')
            //Verifica se o id no banco de dados existe
            database.select('id').where({id}).table('cardcolor').then(color => {
                //Caso o id não exista
                if(color.length == 0){
                    res.status(404).send({message: 'color id not exist'})
                }else{
                    database.select('color').where({color: body.color}).table('cardcolor').then(color =>{
                        //Verifica se existe algum registro com este nome
                        if(color.length == 0){
                            // Grava log
                            database.select().where({id}).table('cardcolor').then(card => {
                                const objLog = {
                                    user: user.mail,
                                    logType: 'Update',
                                    lineTableId: parseInt(card[0].id),
                                    tableName: 'cardColor',
                                    lastValue: JSON.stringify(card[0]),
                                    dateTime: moment().format('YYYY-MM-DD HH:mm:ss')
                                }
                                database.insert(objLog).into('logs').then()
                            })
                            //Caso não exista atualiza o registros
                            database.where({id}).update(body).table('cardcolor').then(color => {
                                res.status(200).send({message: 'color updated'})
                            })
                        }else{
                            //Caso exista apresenta que o registro já existe
                            res.status(409).send({message: 'color exist'})                
                        }
                    }).catch(err => {
                        res.status(400).send(err)
                    })
                }
            })
        }else{
            //Caso não tenha permissão de adminsitrador é enviada a mensagem de não autorizado
            res.status(401).send({message: 'Unauthorized'})
        }

    },

    Delete(req, res){
        const {id} = req.params
        const authorizationCode = req.headers.authorization
        const token = authorizationCode.split(' ')[1]
        const user = jwt.decode(token)

        //Verifica se tem permissão de administrador
        if(user.permission == 0){
            //Verifica se o id no banco de dados existe
            database.select('id').where({id}).table('cardcolor').then(color => {
                //Caso o id não exista
                if(color.length == 0){
                    res.status(404).send({message: 'color id not exist'})
                }else{
                    // Grava log
                    database.select().where({id}).table('cardcolor').then(card => {
                        const objLog = {
                            user: user.mail,
                            logType: 'Delete',
                            lineTableId: parseInt(card[0].id),
                            tableName: 'cardColor',
                            lastValue: JSON.stringify(card[0]),
                            dateTime: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        database.insert(objLog).into('logs').then()
                    })
                    // Caso o id exista deleta o registro no banco de dados utilizando o id
                    database.where({id}).delete().table('cardcolor').then(color => {
                        res.status(200).send({message: 'color deleted'})
                    }).catch(err => {
                        res.status(400).send(err)
                    })
                }
            })
        }else{
            //Caso não tenha permissão de adminsitrador é enviada a mensagem de não autorizado
            res.status(401).send({message: 'Unauthorized'})
        }
        
    }
}