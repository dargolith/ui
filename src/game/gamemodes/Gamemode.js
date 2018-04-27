import settings from '../../config';
import PlayerCircle from '../entities/PlayerCircle';
import PlayerController from '../entities/controllers/PlayerController';
import LocalPlayerController from '../entities/controllers/LocalPlayerController';
import iconData from '../iconData';

/*
Gamemode base class.
*/
class Gamemode {
  /* eslint-disable class-methods-use-this, no-unused-vars, no-useless-constructor,
  no-empty-function */
  constructor(game, resources) {
    this.game = game;
    this.resources = resources;
    this.game.registerResizeListener(this);
    this.onButtonPressed = this.onButtonPressed.bind(this);
  }

  init() {
    if (settings.game.localPlayer) {
      this.onPlayerJoin({
        iconID: 1,
        id: 'local',
        backgroundColor: '#EE6666',
        iconColor: '#00ffff',
      }).then(localPlayer => {
        localPlayer.setController(new LocalPlayerController(this.game, 'local'));
        localPlayer.y = 300;
      });
      this.onPlayerJoin({
        iconID: 2,
        id: 'local2',
        backgroundColor: '#EEFFF66',
        iconColor: '#4422ff',
      }).then(localPlayer => {
        localPlayer.y = 350;
      });
    }
  }
  /* eslint-enable class-methods-use-this, no-unused-vars, no-useless-constructor,
  no-empty-function */

  /* eslint-disable class-methods-use-this, no-unused-vars */
  // Called before the game objects are updated and physics are calculated.
  preUpdate(dt) {}

  // Called after physics calculation but before the graphics is updated.
  postUpdate(dt) {}

  // Called when a new player connects
  onPlayerJoin(playerObject) {
    const { iconID } = playerObject;
    const idTag = playerObject.id;

    return new Promise((resolve, reject) => {
      this.game.resourceServer
        .requestResources([{ name: iconData[iconID].name, path: iconData[iconID].img }])
        .then(resources => {
          const circle = new PlayerCircle(this.game, resources[iconData[iconID].name]);
          const controller = new PlayerController(this.game, idTag);
          circle.setController(controller);
          const backgroundCol = Number.parseInt(playerObject.backgroundColor.substr(1), 16);
          const iconCol = Number.parseInt(playerObject.iconColor.substr(1), 16);

          circle.setColor(backgroundCol, iconCol);
          this.onPlayerCreated(playerObject, circle);

          resolve(circle);
        });
    });
  }

  // Called after a player has joined and their circle has been created.
  onPlayerCreated(playerObject, circle) {}

  // Called when a player disconnects
  onPlayerLeave(idTag) {
    const entities = this.game.entityHandler.getEntities().slice();

    for (let i = 0; i < entities.length; i += 1) {
      const currentEntity = entities[i];
      if (
        typeof currentEntity.controller !== 'undefined' &&
        currentEntity.controller.id === idTag
      ) {
        this.game.entityHandler.unregisterFully(currentEntity);
        return;
      }
    }
  }

  onButtonPressed(id, button) {}

  // Force all gamemmodes to implement this
  onWindowResize() {
    throw new Error('Override onWindowResize');
  }

  // Clean up after the gamemode is finished.
  cleanUp() {}
  /* eslint-enable class-methods-use-this, no-unused-vars */
}

export default Gamemode;
