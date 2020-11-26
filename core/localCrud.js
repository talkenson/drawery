const CrudStore = {
  Pixels: 'store-pixels',
  Lines: 'store-lines',
  Rectangles: 'store-rects',
  Polygons: 'store-polygons',
  Temporaries: 'store-temporaries',
  State: 'store-state-saver',
};

class StorageAssistant {
  op = window.localStorage;

  // get(key: string, expectedValue: string | null) -> realValue || expectedValue[string | null]
  get = (key, expectedValue) => {
    let rawValue = this.op.getItem(key), value;
    try {
      value = JSON.parse(rawValue);
    } catch (e) {
      value = rawValue;
    }
    return value || expectedValue
  };

  // set(key: string, value: string) -> void
  set = (key, value) => {
    if (typeof value !== "string") value = JSON.stringify(value);
    this.op.setItem(key, value);
  };

  // delete(key: string) -> void
  delete = (key) => {
    this.op.removeItem(key)
  };

  // _clear() -> [Native].clear
  _clear = this.op.clear;
}

class Crud {
  storeName = null;
  prefix = 'CrudStorage__';
  sa = new StorageAssistant();
  state = {
    value: [],
  };

  constructor(store) {
    if (!store) {
      throw new Error('There\'s no Store provided to Crud constructor! (E: emp_constructor_called)');
    }
    if (typeof store !== 'string') {
      throw new Error('Incorrect Store name provided to Crud constructor! (E: incorrect_store_name)');
    }
    this.storeName = this.prefix + store;
    console.log('Crud::Build :', this.storeName);
    if (!EventManager.findListeners(this.storeName).length) {
      console.log('There\'s no Initialization found. Initializing manually...');
      this.init();
    }
  }


  init = () => {

    console.log('Crud::Init :', this.storeName);

    EventManager.addListener(this.storeName, this.eventHandler, 'crud-init');
    //document.addEventListener(this.storeName + '_update', this.eventHandler);
    this.__purgeData();
  };

  create = (iObjectAny) => {
    let temp = this.sa.get(this.storeName, null) || this.state;
    console.log(temp);
    temp.value.push(iObjectAny);
    this.sa.set(this.storeName, temp);
    EventManager.dispatchEvent(this.storeName, {"type": 'add'}, 'crud-create');
    //document.dispatchEvent(new CustomEvent(this.storeName + '_update', {"detail": {"type": 'add'}}));
  };

  update = (iGeneralObjectAny) => {
    this.sa.set(this.storeName, iGeneralObjectAny);
    EventManager.dispatchEvent(this.storeName, {"type": 'update'}, 'crud-update');
    //document.dispatchEvent(new CustomEvent(this.storeName + '_update', {"detail": {"type": 'update'}}));
  };

  getAll = () => {
    return this.sa.get(this.storeName, null) || this.state;
  };

  eventHandler = (event) => {
    // redraw()????????
    console.log(`UPDATE: ${event.type} with`, event.detail);
  };

  __purgeData = () => {
    console.log('purging', this.storeName, '...');
    this.sa.delete(this.storeName)
  }

}
