const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Probando ruta /layers (Capas del Mapa)', () => {
  // var para token de autorización para realizar las pruebas
  let token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdC5jb20iLCJyb2xlIjp7ImlkX3JvbGUiOiIxIiwibmFtZSI6ImFkbWluIiwiZXh0ZXJuYWxfaWQiOiJkNjE0MzA3Yi1mMzI1LTQzMGItOGFkNC02MzY2ODA2ZmUzYWQiLCJjcmVhdGVkX2F0IjoiMjAyMy0wNy0wOFQyMjowMDowOS45NjVaIiwidXBkYXRlZF9hdCI6IjIwMjMtMDctMDhUMjI6MDA6MDkuOTY1WiJ9LCJpYXQiOjE2ODg4NTM4NTV9.afDeaY84d5lD4v9kiZd7gIQaRBhLdspEh9GKERC2jxM';
  let id = null;        // var para el ID de la capa shape creada
  let external = null;  // var para el EXTERNAL ID de la capa shape creada

  let id2 = null;       // var para el ID de la capa raster creada
  let external2 = null; // var para el EXTERNAL ID de la capa raster creada 

  afterEach(() => {
    app = rewire('../app'); // inyección de dependencias y espionaje de funciones
    sandbox.restore();      // restaura el ambiente de pruebas
  });

  // Prueba No. 1
  describe('Probar Obtención de Capas', () => {

    // Prueba positiva
    it('GET /all | Debería devolver los datos de las capas registradas.', (done) => {
      request(app)
        .get('/api/v1/layers/all')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          let arr = res.body;
          if(arr.length > 0) {
            id = arr[0].id_layer;
            external = arr[0].external_id;
          }
          done(err);
        });
    });

    // Prueba positiva
    it('GET /get/:id | Debería devolver los datos de una capa.', (done) => {
      request(app)
        .get(`/api/v1/layers/get/${external}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('name');          
          expect(res.body).to.have.property('external_id');
          expect(res.body).to.have.property('category_id');
          done(err);
        });
    });
  });

  // Prueba No. 2
  describe('Probar Creación de Capas Ráster y Vectorial', () => {

    // Prueba positiva
    it('POST /shapes | Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .post(`/api/v1/layers/shapes`)
        .set('Authorization', `Bearer ${token}`)
        .field('fileProps', '{"name": "Capa Test","type":"shapes","status": true}')
        .attach('file','/home/ikarous/geoportal-api/public/uploads/cobertura_ecuador.zip')
        .attach('styles','/home/ikarous/geoportal-api/public/uploads/cobertura_estilos.sld')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          id = res.body.id_layer;
          external = res.body.external_id;
          expect(res.body).to.have.property('name');          
          expect(res.body).to.have.property('external_id');
          expect(res.body).to.have.property('category_id');
          done(err);
        });
    });

    // Prueba negativa (error)
    it('POST /shapes | Debería fallar cuando se envía los datos incorrectos.', (done) => {
      request(app)
        .post(`/api/v1/layers/shapes`)
        .field('fileProps', '{"name": "Capa Test","type":"shapes","status": true}')
        .attach('file','/home/ikarous/geoportal-api/public/uploads/cobertura_ecuador.zip')
        .attach('styles','/home/ikarous/geoportal-api/public/uploads/cobertura_estilos.sld')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });

    // Prueba positiva
    it('POST /raster | Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .post(`/api/v1/layers/raster`)
        .set('Authorization', `Bearer ${token}`)
        .field('fileProps', '{"name": "Capa Test Raster","type":"raster","status": true}')
        .attach('file','/home/ikarous/geoportal-api/public/uploads/dc8d0d8b-b139-4702-b774-7ac95e9d1204.tif')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          id2 = res.body.id_layer;
          external2 = res.body.external_id;
          expect(res.body).to.have.property('name');          
          expect(res.body).to.have.property('external_id');
          expect(res.body).to.have.property('category_id');
          done(err);
        });
    });

    // Prueba negativa (error)
    it('POST /raster | Debería fallar cuando se envía los datos incorrectos.', (done) => {
      request(app)
        .post(`/api/v1/layers/raster`)
        .field('fileProps', '{"name": "Capa Test Raster","type":"raster","status": true}')
        .attach('file','/home/ikarous/geoportal-api/public/uploads/dc8d0d8b-b139-4702-b774-7ac95e9d1204.tif')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');
          done(err);
        });
    });
  });

  // Prueba No. 3
  describe('Probar Modificación de Capas', () => {

    // Prueba positiva
    it('PUT /:id | Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .put(`/api/v1/layers/${external}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Capa editada"
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('data');   
          done(err);
        });
    });

    // Prueba negativa (error)
    it('PUT /:id | Debería fallar cuando se envía los datos incorrectos.', (done) => {
      request(app)
        .put(`/api/v1/layers/${external}`)
        .expect('Content-Type', /json/)
        .send({
          "name": "Capa editada"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body).to.have.property('message');   
          done(err);
        });
    });
  });

  // Prueba No. 4
  describe('Probar Eliminación de Capas', () => {

    // Prueba positiva
    it('DELETE /:id | (Vectorial) Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .delete(`/api/v1/layers/${external}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          done(err);
        });
    });

    // Prueba positiva
    it('DELETE /:id | (Ráster) Debería tener éxito cuando se envía los datos correctos.', (done) => {
      request(app)
        .delete(`/api/v1/layers/${external2}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          done(err);
        });
    });
  });
});