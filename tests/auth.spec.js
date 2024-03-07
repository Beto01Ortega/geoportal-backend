const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Probando ruta /auth (Autorización/Autenticación)', () => {
  let token = null;
  let id = null;

  afterEach(() => {
    app = rewire('../app');
    sandbox.restore();
  });

  describe('Probando Inicio de Sesión', () => {
    it('POST /login | Debería tener éxito cuando se envíen las credenciales correctas.', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .expect('Content-Type', /json/)
        .send({
          email: 'admin@localhost.com',
          password: 'admin_pass',
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          expect(res.body).to.have.property('data');
          expect(res.body).to.have.property('token');
          done(err);
        });
    });
  
    it('POST /login | Debería fallar cuando se envíen las credenciales incorrectas.', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .expect('Content-Type', /json/)
        .send({
          email: 'admin@localhost.com',
          password: 'admin_pas',
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  describe('Probando obtención de datos de sesión', () => {
    it('GET /get-data | Debería devolver los datos del usuario cuando se envía el token de sesión.', (done) => {
      request(app)
        .get('/api/v1/auth/get-data')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('data');
          expect(res.body).to.have.property('token');
          done(err);
        });
    });
  
    it('GET /get-data | Debería fallar cuando NO se envía el token de sesión.', (done) => {
      request(app)
        .get('/api/v1/auth/get-data')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  
    it('GET /get-data | Debería fallar cuando se envía un token de sesión incorrecto.', (done) => {
      request(app)
        .get('/api/v1/auth/get-data')
        .set('Authorization', `aa`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  describe('Probando Registro de Usuario (Visitantes)', () => {
    it('POST /signup | Debería tener éxito cuando se envíen los datos correctos.', (done) => {
      request(app)
        .post('/api/v1/auth/signup')
        .expect('Content-Type', /json/)
        .send({
          name: "Ejemplo",
          email: "cuentatest@example.com",
          password: "Asd123654789#"
        })
        .expect(200)
        .end((err, res) => {
          id = res.body.data;
          expect(res.body).to.have.property('data');
          done(err);
        });
    });

    it('POST /signup | Debería fallar cuando se envíen los datos incompletos.', (done) => {
      request(app)
        .post('/api/v1/auth/signup')
        .expect('Content-Type', /json/)
        .send({
          name: "Ejemplo",
        })
        .expect(400)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  after('after', async () => {
    // Eliminar la cuenta creada
    await request(app)
      .delete(`/api/v1/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .then(res => {});
  });
});