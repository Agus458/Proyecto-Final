export const admin = {
    email: "admin@admin.com",
    contrasenia: "admin"
}

export const postulante = {
    email: "user@mail.com",
    contrasenia: "1234"
}

export const invalidIniciarSesion = [
    {},
    {email: ""},
    {contrasenia: ""},
    {email: "admin@mail.com", contrasenia: ""},
    {email: "admin@admin.com", contrasenia: "1234"},
    {email: 123, contrasenia: true},
    {email: {}, contrasenia: []},
]

export const invalidRegistrar = [
    {},
    {email: ""},
    {contrasenia: ""},
    postulante,
    {email: 123, contrasenia: true},
    {email: {}, contrasenia: []},
]