create database bigstret;
use bigstret;

create table usuario(
id_usuario int primary key auto_increment,
nome_user varchar (100) not null,
cpf bigint(11) not null unique,
data_nascimento date not null,
peso float not null,
altura float not null,
email varchar(150) not null unique,
senha varchar(16) not null,
cep bigint(8) not null,
bairro_user varchar(100),
cidade_user varchar(100) not null,
uf_user enum('MG', 'RJ', 'SP') not null,
avaliacao float
);

create table quadra(
id_quadra int primary key auto_increment,
nome_quadra varchar(100) not null,

rua_quadra varchar(100) not null,
numero_quadra varchar(100) not null,
cidade_quadra varchar(100) not null,
bairro_quadra varchar(100) not null,
cep_quadra int not null,
estado_quadra enum('MG','RJ', 'SP') not null,

superficie varchar(100) not null,
esporte_quadra varchar(250) not null,
capacidade int not null,
horario_fun timestamp not null,
disponibilidade enum('reservada', 'livre') not null,
usuario_id int,
foreign key (usuario_id) references usuario(id_usuario)
);

create table evento(
id_evento int primary key auto_increment,
nome_evento varchar(100) not null,
tipo enum ('Quadra publica', 'Quadra Alugada') not null,
faixa_etaria int not null,
genero enum('misto', 'feminino', 'masculino'),
esporte_evento enum('Volei', 'Futebol', 'Basquete', 'Tenis', 'Corrida') not null,
descricao_evento varchar(150),

horario_inicio timestamp not null,
horario_termino timestamp not null,

max_jogadorees int not null,
qtd_times int,
jogadores_time int,

valor_aluguel decimal,
horas_aluguel int,
pix varchar(150),
beneficiario varchar(150),
banco varchar(50),


rua_evento varchar(100) not null,
numero_evento varchar(100) not null,
cidade_evento varchar(100) not null,
bairro_evento varchar(100) not null,
cep_evento int not null,
ponto_ref varchar(100),

codigo_convite varchar(5) unique,
usuario_id int not null,
quadra_id int,
foreign key (quadra_id) references quadra(id_quadra),
foreign key(usuario_id) references usuario(id_usuario)


);

select * from usuario;