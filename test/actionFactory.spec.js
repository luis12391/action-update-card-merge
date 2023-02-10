const _factory = require("../src/actionFactory");

describe("Test action factory", () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  test("It should create an action with the type: actionFactory", () => {
    //Arrange

    //act
    const build = _factory.build();

    //assert
    expect(build.constructor.name).toEqual("actionFactory");
  });

  test("it should create an action with the method 'exec' when the name CREATE_CLICKUP_RELEASE_CARD is passed", () => {
    //Arrange
    const actionType = "CREATE_CLICKUP_RELEASE_CARD";
    const build = _factory.build();

    //act
    const action = build.createAction(actionType);

    //assert
    expect(action).toHaveProperty("exec");

    //jest.spyOn(build.createAction, 'random').mockReturnValue(randomNumberExpected)*/
  });

  test("it should create an action with the method 'exec' when the name ADD_SUBTASKS_TO_RELEASE_CARD is passed", () => {
    //Arrange
    const actionType = "ADD_SUBTASKS_TO_RELEASE_CARD";
    const build = _factory.build();

    //act
    const action = build.createAction(actionType);

    //assert
    expect(action).toHaveProperty("exec");
  });

  test("it should throw an error when a wrong action type is passed", () => {
    //Arrange
    const actionType = "WRONG_OPTION";
    const build = _factory.build();

    //assert
    expect(() => {
      build.createAction(actionType);
    }).toThrow("The action type is wrong: WRONG_OPTION");
  });
});
