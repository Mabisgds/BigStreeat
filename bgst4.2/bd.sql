create database bigstret;

use bigstret;

create table
    usuario (
        id_usuario int primary key auto_increment,
        nome_user varchar(100) not null,
        cpf bigint (11) not null unique,
        data_nascimento date not null,
        peso float not null,
        altura float not null,
        email varchar(150) not null unique,
        senha varchar(16) not null,
        cep bigint (8) not null,
        rua_user varchar(100) not null,
        bairro_user varchar(100),
        cidade_user varchar(100) not null,
        uf_user varchar(100) not null,
        latitude float,
        longitude float,
        avaliacao float
    );

create table
    quadra (
        id_quadra int primary key auto_increment,
        nome_quadra varchar(100) not null,
        rua_quadra varchar(100) not null,
        numero_quadra varchar(100) not null,
        cidade_quadra varchar(100) not null,
        bairro_quadra varchar(100) not null,
        cep_quadra varchar(8) not null,
        estado_quadra varchar(100) not null,
        superficie enum ('Areia', 'Concreto', 'Grama'),
        esporte_quadra varchar(250) not null,
        capacidade int not null,
        usuario_id int,
        foreign key (usuario_id) references usuario (id_usuario)
    );

create table
    eventos (
        id_evento int primary key auto_increment,
        nome_evento varchar(100) not null,
        tipo enum ('Quadra publica', 'Quadra Alugada') not null,
        faixa_etaria varchar(100) not null,
        genero enum ('misto', 'feminino', 'masculino'),
        esporte_evento enum (
            'Volei',
            'Futebol',
            'Basquete',
            'Tenis',
            'Corrida'
        ) not null,
        descricao_evento varchar(150),
        data_evento date not null,
        horario_inicio timestamp not null,
        horario_termino timestamp not null,
        max_jogadorees int,
        qtd_times int,
        jogadores_time int,
        valor_aluguel decimal,
        horas_aluguel int,
        pix varchar(150),
        beneficiario varchar(150),
        banco varchar(50),
        rua_numero varchar(100) not null,
        cidade_evento varchar(100) not null,
        bairro_evento varchar(100) not null,
        cep_evento varchar(8) not null,
        codigo_convite varchar(5),
        usuario_id int not null,
        quadra_id int,
        foreign key (quadra_id) references quadra (id_quadra),
        foreign key (usuario_id) references usuario (id_usuario)
    );

drop table eventos;

drop database bigstret;

TRUNCATE TABLE usuario;

select
    *
from
    eventos;

select
    *
from
    usuario;

select
    *
from
    quadra;
