const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Probando ruta /users (Cuentas de Usuario)', () => {
  let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5jb20iLCJyb2xlIjp7ImlkX3JvbGUiOiIxIiwibmFtZSI6ImFkbWluIiwiZXh0ZXJuYWxfaWQiOiJkNjE0MzA3Yi1mMzI1LTQzMGItOGFkNC02MzY2ODA2ZmUzYWQiLCJjcmVhdGVkX2F0IjoiMjAyMy0wNy0wOFQyMjowMDowOS45NjVaIiwidXBkYXRlZF9hdCI6IjIwMjMtMDctMDhUMjI6MDA6MDkuOTY1WiJ9LCJpYXQiOjE2ODg4NTM4NTV9.afDeaY84d5lD4v9kiZd7gIQaRBhLdspEh9GKERC2jxM';
  let visitor = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyIiwiZW1haWwiOiJjdWVudGE1QGV4YW1wbGUuY29tIiwicm9sZSI6eyJpZF9yb2xlIjoiMyIsIm5hbWUiOiJ2aXNpdG9yIiwiZXh0ZXJuYWxfaWQiOiJmZWYxMDBjZi04OTNiLTQ4ZGUtYTBlYS0xMmNhOGE3N2QzYjkiLCJjcmVhdGVkX2F0IjoiMjAyNC0wMi0yNlQwMToyMDowMy4zMjJaIiwidXBkYXRlZF9hdCI6IjIwMjQtMDItMjZUMDE6MjA6MDMuMzIyWiJ9LCJpYXQiOjE3MDk3NzQ3OTZ9.NYhJtqPuFmZRnnupnPVTZI0Vr1SUKVWf1vgrL8zhDKI';
  let id = null;

  afterEach(() => {
    app = rewire('../app');
    sandbox.restore();
  });

  describe('Probar Obtención de Usuarios', () => {
    it('GET /all | Debería devolver los datos de los usuarios registrados.', (done) => {
      request(app)
        .get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          let arr = res.body;
          if(arr.length > 0) {
            id = arr[0].external_id;
          }
          done(err);
        });
    });

    it('GET /all | Debería fallar al no tener rol de admin.', (done) => {
      request(app)
        .get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${visitor}`)
        .expect(403)
        .end((err, res) => {
          done(err);
        });
    });

    it('GET /all | Debería fallar al no tener el token de autorización.', (done) => {
      request(app)
        .get('/api/v1/users/all')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          done(err);
        });
    });

    it('GET /get/:id | Debería devolver los datos de un usuario en específico.', (done) => {
      request(app)
        .get(`/api/v1/users/get/${id}`)
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('external_id');
          done(err);
        });
    });
  });

  describe('Probar Creación de Usuarios', () => {
    it('POST / | Debería tener éxito cuando se envíen los datos correctos.', (done) => {
      request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "User",
          "email": "user4@example.com",
          "password": "user_123",
          "role_id": "2"
        })
        .expect(200)
        .end((err, res) => {
          id = res.body.data;
          expect(res.body).to.have.property('data');
          done(err);
        });
    });

    it('POST / | Debería fallar cuando se envíen los datos incorrectos.', (done) => {
      request(app)
        .post('/api/v1/users')
        .expect('Content-Type', /json/)
        .send({
          "name": "User",
          "email": "user1@example.com",
          "password": "user_123",
          "role_id": "2"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  describe('Probar Eliminar Usuarios', () => {
    it('DELETE /:id | Debería tener éxito cuando se envían los datos correctos', (done) => {
      request(app)
        .delete(`/api/v1/users/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          done(err);
        });
    });

    it('DELETE /:id | Debería tener éxito cuando se envían los datos incorrectos', (done) => {
      request(app)
        .delete(`/api/v1/users/${id}`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          done(err);
        });
    });
  });
});