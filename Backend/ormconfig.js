module.exports = [
    {
        "name": "default",
        "type": "mysql",
        "host": "localhost",
        "port": 3306,
        "username": "root",
        "password": "tisj",
        "database": "bolsa-de-trabajo",
        "synchronize": true,
        "logging": false,
        "entities": [
            "dist/app/models/**/*.js"
        ]
    },
    {
        "name": "appsocios",
        "type": "postgres",
        "host": "db.cpyxafjlyybbgggzhnfd.supabase.co",
        "port": 5432,
        "username": "postgres",
        "password": "MaxiSebaMartin",
        "database": "postgres",
        "synchronize": false,
        "logging": false
    }
]