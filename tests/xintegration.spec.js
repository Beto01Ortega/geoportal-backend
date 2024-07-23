const chai    = require('chai');
const request = require('supertest');
const rewire  = require('rewire');
const sinon   = require('sinon');

const sandbox = sinon.createSandbox();
const expect  = chai.expect;

let app = rewire('../app');

describe('Ejecutando pruebas de integración...', () => {
  // vars para autorización
  let auth_token = null;
  let auth_id = null;

  // vars para la categoría
  let category_id = null;
  let category_external = null;

  // var para las capas
  let layer_shape_id = null;
  let layer_shape_external = null;

  let layer_raster_id = null;
  let layer_raster_external = null;

  // Se inicia sesión para obtener el token de autorización
  // PARAMETROS UTILIZADOS:
  // email: admin@localhost.com
  // clave: admin_pass
  it(' -- POST /auth/login | Iniciando sesión... ', (done) => {
    request(app)
      .post('/api/v1/auth/login')
      .expect('Content-Type', /json/)
      .send({
        email: 'admin@localhost.com',
        password: 'admin_pass',
      })
      .expect(200)
      .end((err, res) => {
        auth_token = res.body.token;
        auth_id = res.body.data.external_id;
        expect(res.body).to.have.property('data');
        expect(res.body).to.have.property('token');
        done(err);
      });
  });

  // Con el token de autorización se obtienen los datos del usuario
  // PARAMETROS UTILIZADOS:
  // token: (obtenido del inicio de sesión)
  // ID: (obtenido del inicio de sesión)
  it(' -- GET /users/get/:id | Obteniendo los datos del usuario...', (done) => {
    request(app)
      .get(`/api/v1/users/get/${auth_id}`)
      .expect('Content-Type', /json/)
      .set('Authorization', `Bearer ${auth_token}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('external_id');
        done(err);
      });
  });

  // Con el token de autorización se crea la categoría
  // PARAMETROS UTILIZADOS:
  // token: (obtenido del inicio de sesión)
  // nombre: Categoría de prueba (Integración)
  it(' -- POST /categories/ | Creando categoría...', (done) => {
    request(app)
      .post(`/api/v1/categories`)
      .set('Authorization', `Bearer ${auth_token}`)
      .expect('Content-Type', /json/)
      .send({
        "name": "Categoría de prueba (Integración)"
      })
      .expect(200)
      .end((err, res) => {
        category_id = res.body.id_category;
        category_external = res.body.external_id;
        expect(res.body).to.have.property('name');          
        expect(res.body).to.have.property('external_id');
        expect(res.body).to.have.property('layers');
        expect(res.body).to.have.property('parent_id');
        done(err);
      });
  });

  // Con el token de autorización y el id de la categoría se crea la capa shape
  // PARAMETROS UTILIZADOS:
  // token: (obtenido del inicio de sesión)
  // ID categoría: (obtenido de la creación anterior)
  // nombre: Capa Test
  // tipo: shape
  // estado: activo (true)
  // archivo zip: cobertura_ecuador.zip
  // archivo sld: cobertura_estilos.sld
  it(' -- POST /layers/shapes | Creando capa SHAPE...', (done) => {
    request(app)
      .post(`/api/v1/layers/shapes`)
      .set('Authorization', `Bearer ${auth_token}`)
      .field('fileProps', `
        {
          "name": "Capa Test",
          "type":"shapes",
          "status": true,
          "category_id": ${category_id}
        }
      `)
      .attach('file','/home/ikarous/archivos/cobertura_ecuador.zip')
      .attach('styles','/home/ikarous/archivos/cobertura_estilos.sld')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        layer_shape_id = res.body.id_layer;
        layer_shape_external = res.body.external_id;
        expect(res.body).to.have.property('name');          
        expect(res.body).to.have.property('external_id');
        expect(res.body).to.have.property('category_id');
        done(err);
      });
  });

  // Con el token de autorización y el id de la categoría se crea la capa raster
  // PARAMETROS UTILIZADOS:
  // token: (obtenido del inicio de sesión)
  // ID categoría: (obtenido de la creación anterior)
  // nombre: Capa Test Raster
  // tipo: raster
  // estado: activo (true)
  // archivo tif: dc8d0d8b-b139-4702-b774-7ac95e9d1204.tif
  it(' -- POST /layers/raster | Creando capa RASTER...', (done) => {
    request(app)
      .post(`/api/v1/layers/raster`)
      .set('Authorization', `Bearer ${auth_token}`)
      .field('fileProps', `
        {
          "name": "Capa Test Raster",
          "type":"raster",
          "status": true,
          "category_id": ${category_id}
        }
      `)
      .attach('file','/home/ikarous/archivos/dc8d0d8b-b139-4702-b774-7ac95e9d1204.tif')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        layer_raster_id = res.body.id_layer;
        layer_raster_external = res.body.external_id;
        expect(res.body).to.have.property('name');          
        expect(res.body).to.have.property('external_id');
        expect(res.body).to.have.property('category_id');
        done(err);
      });
  });

  // Se ejecuta después de finalizar las pruebas
  after('after', async () => {
    // Eliminar la cuenta creada
    if(category_external) {
      await request(app)
        .delete(`/api/v1/categories/${category_external}`)
        .set('Authorization', `Bearer ${auth_token}`)
        .then(res => {});
    }

    if(layer_shape_external) {
      await request(app)
        .delete(`/api/v1/layers/${layer_shape_external}`)
        .set('Authorization', `Bearer ${auth_token}`)
        .then(res => {});
    }

    if(layer_raster_external) {
      await request(app)
        .delete(`/api/v1/layers/${layer_raster_external}`)
        .set('Authorization', `Bearer ${auth_token}`)
        .then(res => {});
    }
  });
});