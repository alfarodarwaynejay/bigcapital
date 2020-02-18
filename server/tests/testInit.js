import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiThings from 'chai-things';
import knex from '@/database/knex';
import '@/models';
import app from '@/app';
import factory from '@/database/factories';
// import { hashPassword } from '@/utils';

const request = () => chai.request(app);
const { expect } = chai;

beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
});

afterEach(async () => {
  await knex.migrate.rollback();
});

chai.use(chaiHttp);
chai.use(chaiThings);

const login = async (givenUser) => {
  const user = !givenUser ? await factory.create('user') : givenUser;

  const response = await request()
    .post('/api/auth/login')
    .send({
      crediential: user.email,
      password: 'admin',
    });

  return response;
};

const create = async (name, data) => factory.create(name, data);
const make = async (name, data) => factory.build(name, data);

export {
  login,
  create,
  make,
  expect,
  request,
};