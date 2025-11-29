const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());

// Configuración de la base de datos
const dbConfig = {
  host: 'mysql-bc27dbd-tecnm-b5bf.g.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_A1WWxLvZZskUbfqOs3O',
  database: 'compania_aerea',
  port: '14425'
};

// Esquema GraphQL COMPLETO
const schema = buildSchema(`
    type Base {
        codigo_base: String!
        nombre_base: String!
        ubicacion: String!
    }

    type TipoAvion {
        codigo_tipo: String!
        nombre_tipo: String!
    }

    type Avion {
        codigo_avion: String!
        codigo_tipo: String!
        codigo_base: String!
        fecha_adquisicion: String
        tipo: TipoAvion
        base: Base
    }

    type Piloto {
        codigo_piloto: String!
        nombre: String!
        horas_vuelo: Int!
        codigo_base: String!
        fecha_contratacion: String
        base: Base
    }

    type Tripulante {
        codigo_tripulante: String!
        nombre: String!
        codigo_base: String
        fecha_contratacion: String
        base: Base
    }

    type Vuelo {
        numero_vuelo: String!
        origen: String!
        destino: String!
        hora_salida: String!
        fecha_vuelo: String!
        codigo_avion: String
        codigo_piloto: String
        estado: String!
        avion: Avion
        piloto: Piloto
        tripulacion: [Tripulante]
    }

    input BaseInput {
        codigo_base: String!
        nombre_base: String!
        ubicacion: String!
    }

    input AvionInput {
        codigo_avion: String!
        codigo_tipo: String!
        codigo_base: String!
        fecha_adquisicion: String
    }

    input PilotoInput {
        codigo_piloto: String!
        nombre: String!
        horas_vuelo: Int!
        codigo_base: String!
        fecha_contratacion: String
    }

    input TripulanteInput {
        codigo_tripulante: String!
        nombre: String!
        codigo_base: String
        fecha_contratacion: String
    }

    input VueloInput {
        numero_vuelo: String!
        origen: String!
        destino: String!
        hora_salida: String!
        fecha_vuelo: String!
        codigo_avion: String!
        codigo_piloto: String!
        estado: String!
    }

    type Query {
        # Bases
        bases: [Base]
        base(codigo_base: String!): Base
        
        # Tipos de Avión
        tiposAvion: [TipoAvion]
        
        # Aviones
        aviones: [Avion]
        avion(codigo_avion: String!): Avion
        
        # Pilotos
        pilotos: [Piloto]
        piloto(codigo_piloto: String!): Piloto
        
        # Tripulación
        tripulacion: [Tripulante]
        tripulante(codigo_tripulante: String!): Tripulante
        
        # Vuelos
        vuelos: [Vuelo]
        vuelo(numero_vuelo: String!): Vuelo
    }

    type Mutation {
        # Bases
        crearBase(input: BaseInput): Base
        actualizarBase(codigo_base: String!, input: BaseInput): Base
        eliminarBase(codigo_base: String!): Boolean
        
        # Aviones
        crearAvion(input: AvionInput): Avion
        actualizarAvion(codigo_avion: String!, input: AvionInput): Avion
        eliminarAvion(codigo_avion: String!): Boolean
        
        # Pilotos
        crearPiloto(input: PilotoInput): Piloto
        actualizarPiloto(codigo_piloto: String!, input: PilotoInput): Piloto
        eliminarPiloto(codigo_piloto: String!): Boolean
        
        # Tripulación
        crearTripulante(input: TripulanteInput): Tripulante
        actualizarTripulante(codigo_tripulante: String!, input: TripulanteInput): Tripulante
        eliminarTripulante(codigo_tripulante: String!): Boolean
        
        # Vuelos
        crearVuelo(input: VueloInput): Vuelo
        actualizarVuelo(numero_vuelo: String!, input: VueloInput): Vuelo
        eliminarVuelo(numero_vuelo: String!): Boolean
        
        # Asignar tripulación a vuelos
        asignarTripulacionVuelo(numero_vuelo: String!, codigo_tripulante: String!): Boolean
        desasignarTripulacionVuelo(numero_vuelo: String!, codigo_tripulante: String!): Boolean
    }
`);

// Resolvers COMPLETOS
const root = {
    // ========== QUERIES ==========
    
    // Bases
    bases: async () => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM bases');
        await connection.end();
        return rows;
    },

    base: async ({ codigo_base }) => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM bases WHERE codigo_base = ?',
            [codigo_base]
        );
        await connection.end();
        return rows[0];
    },

    // Tipos de Avión
    tiposAvion: async () => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM tipos_avion');
        await connection.end();
        return rows;
    },

    // Aviones
    aviones: async () => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT a.*, t.nombre_tipo, b.nombre_base, b.ubicacion 
            FROM aviones a 
            LEFT JOIN tipos_avion t ON a.codigo_tipo = t.codigo_tipo 
            LEFT JOIN bases b ON a.codigo_base = b.codigo_base
        `);
        await connection.end();
        return rows;
    },

    avion: async ({ codigo_avion }) => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM aviones WHERE codigo_avion = ?',
            [codigo_avion]
        );
        await connection.end();
        return rows[0];
    },

    // Pilotos
    pilotos: async () => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT p.*, b.nombre_base, b.ubicacion 
            FROM pilotos p 
            LEFT JOIN bases b ON p.codigo_base = b.codigo_base
        `);
        await connection.end();
        return rows;
    },

    piloto: async ({ codigo_piloto }) => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM pilotos WHERE codigo_piloto = ?',
            [codigo_piloto]
        );
        await connection.end();
        return rows[0];
    },

    // Tripulación
    tripulacion: async () => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT t.*, b.nombre_base, b.ubicacion 
            FROM tripulacion t 
            LEFT JOIN bases b ON t.codigo_base = b.codigo_base
        `);
        await connection.end();
        return rows;
    },

    tripulante: async ({ codigo_tripulante }) => {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM tripulacion WHERE codigo_tripulante = ?',
            [codigo_tripulante]
        );
        await connection.end();
        return rows[0];
    },

    // Vuelos
    vuelos: async () => {
        const connection = await mysql.createConnection(dbConfig);
        const [vuelos] = await connection.execute(`
            SELECT v.*, a.codigo_tipo, p.nombre as nombre_piloto
            FROM vuelos v 
            LEFT JOIN aviones a ON v.codigo_avion = a.codigo_avion 
            LEFT JOIN pilotos p ON v.codigo_piloto = p.codigo_piloto
        `);

        // Obtener tripulación para cada vuelo
        for (let vuelo of vuelos) {
            const [tripulacion] = await connection.execute(`
                SELECT t.*, b.nombre_base, b.ubicacion 
                FROM vuelo_tripulacion vt 
                LEFT JOIN tripulacion t ON vt.codigo_tripulante = t.codigo_tripulante 
                LEFT JOIN bases b ON t.codigo_base = b.codigo_base 
                WHERE vt.numero_vuelo = ?
            `, [vuelo.numero_vuelo]);
            
            vuelo.tripulacion = tripulacion;
            vuelo.avion = vuelo.codigo_avion ? {
                codigo_avion: vuelo.codigo_avion,
                codigo_tipo: vuelo.codigo_tipo
            } : null;
            
            vuelo.piloto = vuelo.codigo_piloto ? {
                nombre: vuelo.nombre_piloto
            } : null;
        }

        await connection.end();
        return vuelos;
    },

    vuelo: async ({ numero_vuelo }) => {
        const connection = await mysql.createConnection(dbConfig);
        
        // Consulta principal del vuelo
        const [vuelos] = await connection.execute(
            `SELECT v.*, a.codigo_tipo, a.codigo_base as avion_base, 
                    p.nombre as nombre_piloto, p.horas_vuelo, p.codigo_base as piloto_base,
                    b_avion.nombre_base as base_avion_nombre, b_avion.ubicacion as base_avion_ubicacion,
                    b_piloto.nombre_base as base_piloto_nombre, b_piloto.ubicacion as base_piloto_ubicacion
            FROM vuelos v 
            LEFT JOIN aviones a ON v.codigo_avion = a.codigo_avion 
            LEFT JOIN pilotos p ON v.codigo_piloto = p.codigo_piloto
            LEFT JOIN bases b_avion ON a.codigo_base = b_avion.codigo_base
            LEFT JOIN bases b_piloto ON p.codigo_base = b_piloto.codigo_base
            WHERE v.numero_vuelo = ?`,
            [numero_vuelo]
        );
        
        if (vuelos.length === 0) {
            await connection.end();
            return null;
        }
        
        const vuelo = vuelos[0];
        
        // Obtener tripulación del vuelo con información completa de la base
        const [tripulacion] = await connection.execute(
            `SELECT t.codigo_tripulante, t.nombre, t.codigo_base, t.fecha_contratacion,
                    b.codigo_base as base_codigo, b.nombre_base, b.ubicacion
            FROM vuelo_tripulacion vt 
            LEFT JOIN tripulacion t ON vt.codigo_tripulante = t.codigo_tripulante 
            LEFT JOIN bases b ON t.codigo_base = b.codigo_base 
            WHERE vt.numero_vuelo = ?`,
            [numero_vuelo]
        );
        
        await connection.end();
        
        // Helper function para crear objeto base solo si existe
        const createBaseObject = (codigo_base, nombre_base, ubicacion) => {
            if (!codigo_base) return null;
            return {
                codigo_base: codigo_base,
                nombre_base: nombre_base || 'Base desconocida',
                ubicacion: ubicacion || 'Ubicación no especificada'
            };
        };

        // Estructurar la respuesta con las relaciones
        return {
            ...vuelo,
            avion: vuelo.codigo_avion ? {
                codigo_avion: vuelo.codigo_avion,
                codigo_tipo: vuelo.codigo_tipo,
                codigo_base: vuelo.avion_base,
                base: createBaseObject(vuelo.avion_base, vuelo.base_avion_nombre, vuelo.base_avion_ubicacion)
            } : null,
            piloto: vuelo.codigo_piloto ? {
                codigo_piloto: vuelo.codigo_piloto,
                nombre: vuelo.nombre_piloto,
                horas_vuelo: vuelo.horas_vuelo,
                codigo_base: vuelo.piloto_base,
                base: createBaseObject(vuelo.piloto_base, vuelo.base_piloto_nombre, vuelo.base_piloto_ubicacion)
            } : null,
            tripulacion: tripulacion.map(t => ({
                codigo_tripulante: t.codigo_tripulante,
                nombre: t.nombre,
                codigo_base: t.codigo_base,
                fecha_contratacion: t.fecha_contratacion,
                base: createBaseObject(t.base_codigo, t.nombre_base, t.ubicacion)
            }))
        };
    },

    // ========== MUTATIONS ==========
    
    // Bases
    crearBase: async ({ input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO bases (codigo_base, nombre_base, ubicacion) VALUES (?, ?, ?)',
            [input.codigo_base, input.nombre_base, input.ubicacion]
        );
        await connection.end();
        return input;
    },

    actualizarBase: async ({ codigo_base, input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE bases SET nombre_base = ?, ubicacion = ? WHERE codigo_base = ?',
            [input.nombre_base, input.ubicacion, codigo_base]
        );
        await connection.end();
        return { ...input, codigo_base };
    },

    eliminarBase: async ({ codigo_base }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM bases WHERE codigo_base = ?', [codigo_base]);
        await connection.end();
        return true;
    },

    // Aviones
    crearAvion: async ({ input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO aviones (codigo_avion, codigo_tipo, codigo_base, fecha_adquisicion) VALUES (?, ?, ?, ?)',
            [input.codigo_avion, input.codigo_tipo, input.codigo_base, input.fecha_adquisicion]
        );
        await connection.end();
        return input;
    },

    actualizarAvion: async ({ codigo_avion, input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE aviones SET codigo_tipo = ?, codigo_base = ?, fecha_adquisicion = ? WHERE codigo_avion = ?',
            [input.codigo_tipo, input.codigo_base, input.fecha_adquisicion, codigo_avion]
        );
        await connection.end();
        return { ...input, codigo_avion };
    },

    eliminarAvion: async ({ codigo_avion }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM aviones WHERE codigo_avion = ?', [codigo_avion]);
        await connection.end();
        return true;
    },

    // Pilotos
    crearPiloto: async ({ input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO pilotos (codigo_piloto, nombre, horas_vuelo, codigo_base, fecha_contratacion) VALUES (?, ?, ?, ?, ?)',
            [input.codigo_piloto, input.nombre, input.horas_vuelo, input.codigo_base, input.fecha_contratacion]
        );
        await connection.end();
        return input;
    },

    actualizarPiloto: async ({ codigo_piloto, input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE pilotos SET nombre = ?, horas_vuelo = ?, codigo_base = ?, fecha_contratacion = ? WHERE codigo_piloto = ?',
            [input.nombre, input.horas_vuelo, input.codigo_base, input.fecha_contratacion, codigo_piloto]
        );
        await connection.end();
        return { ...input, codigo_piloto };
    },

    eliminarPiloto: async ({ codigo_piloto }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM pilotos WHERE codigo_piloto = ?', [codigo_piloto]);
        await connection.end();
        return true;
    },

    // Tripulación
    crearTripulante: async ({ input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO tripulacion (codigo_tripulante, nombre, codigo_base, fecha_contratacion) VALUES (?, ?, ?, ?)',
            [input.codigo_tripulante, input.nombre, input.codigo_base, input.fecha_contratacion]
        );
        await connection.end();
        return input;
    },

    actualizarTripulante: async ({ codigo_tripulante, input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE tripulacion SET nombre = ?, codigo_base = ?, fecha_contratacion = ? WHERE codigo_tripulante = ?',
            [input.nombre, input.codigo_base, input.fecha_contratacion, codigo_tripulante]
        );
        await connection.end();
        return { ...input, codigo_tripulante };
    },

    eliminarTripulante: async ({ codigo_tripulante }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM tripulacion WHERE codigo_tripulante = ?', [codigo_tripulante]);
        await connection.end();
        return true;
    },

    // Vuelos
    crearVuelo: async ({ input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO vuelos (numero_vuelo, origen, destino, hora_salida, fecha_vuelo, codigo_avion, codigo_piloto, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [input.numero_vuelo, input.origen, input.destino, input.hora_salida, input.fecha_vuelo, input.codigo_avion, input.codigo_piloto, input.estado]
        );
        await connection.end();
        return input;
    },

    actualizarVuelo: async ({ numero_vuelo, input }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE vuelos SET origen = ?, destino = ?, hora_salida = ?, fecha_vuelo = ?, codigo_avion = ?, codigo_piloto = ?, estado = ? WHERE numero_vuelo = ?',
            [input.origen, input.destino, input.hora_salida, input.fecha_vuelo, input.codigo_avion, input.codigo_piloto, input.estado, numero_vuelo]
        );
        await connection.end();
        return { ...input, numero_vuelo };
    },

    eliminarVuelo: async ({ numero_vuelo }) => {
        const connection = await mysql.createConnection(dbConfig);
        // Primero eliminar las asignaciones de tripulación
        await connection.execute('DELETE FROM vuelo_tripulacion WHERE numero_vuelo = ?', [numero_vuelo]);
        // Luego eliminar el vuelo
        await connection.execute('DELETE FROM vuelos WHERE numero_vuelo = ?', [numero_vuelo]);
        await connection.end();
        return true;
    },

    // Asignación de tripulación a vuelos
    asignarTripulacionVuelo: async ({ numero_vuelo, codigo_tripulante }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO vuelo_tripulacion (numero_vuelo, codigo_tripulante) VALUES (?, ?)',
            [numero_vuelo, codigo_tripulante]
        );
        await connection.end();
        return true;
    },

    desasignarTripulacionVuelo: async ({ numero_vuelo, codigo_tripulante }) => {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM vuelo_tripulacion WHERE numero_vuelo = ? AND codigo_tripulante = ?',
            [numero_vuelo, codigo_tripulante]
        );
        await connection.end();
        return true;
    }
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor GraphQL ejecutándose en http://localhost:${PORT}/graphql`);
});