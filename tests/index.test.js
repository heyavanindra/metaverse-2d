import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

describe("Authentication", () => {
  test("User is able to sign up", async () => {
    const username = "avi" + Math.random();
    const password = "112435543";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(response.status).toBe(200);

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(updatedResponse.status).toBe(400);
  });

  test("Signup request fails if the username is empty", async () => {
    const username = `kirat-${Math.random()}`;
    const password = "13214431";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });
    expect(response.status).toBe(400);
  });
  test("signIn succeeds if the username and password are correct", async () => {
    const username = `kirat-${Math.random()}`;
    const password = "1234332";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefinded();
  });
  test("sign-in fails if the username and password are incorrect", async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "WrongUsername",
      password,
    });
    expect(response.status).toBe(403);
  });
});

describe("User metadata EndPoints", () => {
  let token = "";
  let avatarId = "";
  beforeAll(async () => {
    const username = `avi-${Math.random()}`;
    const password = "132134";

    await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
    });
    const response = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/vi/admin/avatar`,

      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }
    );
    avatarId = avatarResponse.data.avatarId;
  });

  test("User cant update their meta data with a wrong avatar id", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId: 12455,
    });
    expect(response.status).toBe(400);
  });

  test("User can update their metadata with right avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.data.status).toBe(200);
  });

  test("user is not able to update their metadata if auth hearder is not present", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          Authorization: "",
        },
      }
    );
    expect(response.status).toBe(401);
  });
});

describe("get back avatar info for a user", () => {
  let avatarId;
  let token;
  let userId;

  beforeAll(async () => {
    const username = `avi-${Math.random()}`;
    const password = "132134";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
    });
    userId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/vi/admin/avatar`,

      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }
    );
    avatarId = avatarResponse.data.avatarId;
  });

  test("Get back avatar for a spacefic user", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });
  test("available avatar lists the currect user ", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metsdata.bulk?ids=[${userId}]`
    );

    expect(response.data.avatar.length).toBe(1);
    expect(response.data.avatar[0].userId).toBe(userId);
  });

  test("Available avatar lists the recently created avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatar.length).not.toBe(0);
    const currentAvatar = response.data.avatar.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("space info", () => {
  let mapId;
  let userId;
  let adminId;
  let userToken;
  let admintoken;
  let element1Id;
  let element2Id;

  beforeAll(async () => {
    const username = `avi-${Math.random()}`;
    const password = "132134";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
      type: "admin",
    });
    adminId = signupResponse.data.adminId;
    const signinResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
      type: "admin",
    });
    admintoken = signinResponse.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/vi/signup`,
      {
        username: username + "-user",
        password,
        type: user,
      }
    );

    userId = userSignupResponse.data.userId;
    const UserSigninResponse = await axios.post(
      `${BACKEND_URL}/api/vi/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );
    userToken = UserSigninResponse.data.token;

    const element1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl: "",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${admintoken}`,
        },
      }
    );
    const element2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl: "",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminId}`,
        },
      }
    );

    element1Id = element1.data.id;
    element2Id = element2.data.id;

    const map = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "",
        dimensions: "100x200",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 30,
            y: 30,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    mapId = map.data.id;
  });

  test("User is able to create a space", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.data.spaceId).toBeDefinded();
  });

  test("User is not able to create a space without a mapId and dimensions", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.status).toBe(400);
  });

  test("User is not able to delete a space that does'nt exist", async () => {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/space/randomIdDoentExist`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.status).toBe(400);
  });

  test("User is able to delete a space that does exist", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const deleteRespones = await axios.post(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(deleteRespones.status).toBe(200);
  });

  test("user should not be able to delete someone else space", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const deleteRespones = await axios.post(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${admintoken}`,
        },
      }
    );
    expect(deleteRespones.status).toBe(403);
  });

  test("Admin has no spaces initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin has no spaces initially", async () => {
    const spaceCreaterResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const filteredSpace = response.data.spaces.find(
      (x) => x.id == spaceCreaterResponse.data.spaceId
    );

    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefinded();
  });
});

describe("Arena block", () => {
 
  let userId;
  let adminId;
  let userToken;
  let admintoken;
  let spaceId;

  beforeAll(async () => {
    const username = `avi-${Math.random()}`;
    const password = "132134";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
      type: "admin",
    });
    adminId = signupResponse.data.adminId;
    const signinResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
      type: "admin",
    });
    admintoken = signinResponse.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/vi/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;
    const UserSigninResponse = await axios.post(
      `${BACKEND_URL}/api/vi/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );
    userToken = UserSigninResponse.data.token;

    const SpaceCreatedResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "test",
        dimensions: "100x200",
      }
    );

    spaceId = SpaceCreatedResponse.data.spaceId;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/33742hf`,{
      headers:{
        Authorization:`Bearer ${userToken}`
      }
    });
    expect(response.statusCode).toBe(400);
  });

  test("Correct space id returns all the elements", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
      headers:{
        Authorization:`Bearer ${userToken}`
      }
    });
    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe("2");
  });

  test("Delete end point is able to delete a element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
      headers:{
        Authorization:`Bearer ${userToken}`
      }
    });
    await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
      spaceId: spaceId,
      elementId: response.data.elements[0].id,
    },{
      headers:{
        Authorization:`Bearer ${userToken}`
      }
    });
    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,{
        headers:{
          Authorization:`Bearer ${userToken}`
        }
      }
    );
    expect(newResponse.data.elements.length).toBe(2);
  });

  test("Add an element fails when the element is added outside the dimentions", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      elementId: element1Id,
      spaceId: spaceId,
      x: 502,
      y: 203239289,
  },{
    headers:{
      Authorization:`Bearer ${userToken}`
    }
  });
    expect(response.status).toBe(404);
  });

  test("adding an element", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      elementId: elementId,
      spaceId: spaceId,
      x: 50,
      y: 50,
    },{
      headers:{
        Authorization:`Bearer ${userToken}`
      }
    });

    expect(response.status).toBe(200);
  });
});

describe('Create an element', () => { 
  let admintoken
  let adminId
  let userToken
  let userId

  beforeAll(async () => {
    const username = `avi-${Math.random()}`;
    const password = "132134";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
      type: "admin",
    });
    adminId = signupResponse.data.adminId;
    const signinResponse = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
      username,
      password,
      type: "admin",
    });
    admintoken = signinResponse.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/vi/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;
    const UserSigninResponse = await axios.post(
      `${BACKEND_URL}/api/vi/signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );
    userToken = UserSigninResponse.data.token;

    const SpaceCreatedResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "test",
        dimensions: "100x200",
      }
    );

    spaceId = SpaceCreatedResponse.data.spaceId;
  });

  test('', async () => { 
    
   })
 })