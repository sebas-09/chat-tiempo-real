import SocketService from "./SocketService";

const mockClients = [];
jest.mock("sockjs-client", () => jest.fn());
jest.mock("@stomp/stompjs", () => ({
  Client: function MockClient() {
    const client = {
      activate: jest.fn(),
      deactivate: jest.fn().mockResolvedValue(),
      subscribe: jest.fn(),
      publish: jest.fn(),
      connected: true,
    };
    mockClients.push(client);
    return client;
  },
}));

beforeEach(() => { mockClients.length = 0; });

test("cancelar una conexión pendiente evita registrar usuarios fantasma", () => {
  const service = new SocketService();
  service.connect("Ana");
  const client = mockClients[0];
  service.disconnect();
  client.onConnect();
  expect(client.publish).not.toHaveBeenCalledWith(
    expect.objectContaining({ destination: "/app/connect" }),
  );
});

test("un nombre rechazado no habilita el envío ni confirma la conexión", () => {
  const service = new SocketService();
  const onConnect = jest.fn();
  const onError = jest.fn();
  service.connect("Ana", { onConnect, onError });
  const client = mockClients[0];
  client.onConnect();
  const registration = client.subscribe.mock.calls.find(([path]) => path === "/user/queue/registration")[1];
  registration({ body: JSON.stringify({ accepted: false, error: "Nombre ocupado" }) });
  expect(onConnect).not.toHaveBeenCalled();
  client.onWebSocketClose();
  expect(onError).toHaveBeenLastCalledWith("Nombre ocupado");
  expect(service.sendMessage("/app/message", { message: "Hola" })).toBe(false);
});

test("solo permite enviar después de la aceptación del servidor", () => {
  const service = new SocketService();
  service.connect("Ana");
  expect(service.sendMessage("/app/message", { message: "Hola" })).toBe(false);
  const client = mockClients[0];
  client.onConnect();
  const registration = client.subscribe.mock.calls.find(([path]) => path === "/user/queue/registration")[1];
  registration({ body: JSON.stringify({ accepted: true }) });
  expect(service.sendMessage("/app/message", { message: "Hola" })).toBe(true);
  expect(client.publish).toHaveBeenCalledWith({
    destination: "/app/message", body: JSON.stringify({ message: "Hola" }),
  });
});
