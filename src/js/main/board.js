//playing field displayed on screen
class board {
  constructor ( offset ){
    this.offset = offset;
    this.const = {
      a: cellSize,
      menuButtons: 10,
      grid: {
        x: null,
        y: null,
      }
    }
    this.var = {
      layer: 0,
      buttonID: 0,
      borderID: 0
    }
    this.array = {
      layer: [],
      button: [],
      border: []
    }

    this.init();
  }

  init(){
    this.initGrid();
    this.initLayers();
    this.initBorders();
    this.initButtons();
  }

  initGrid(){
    this.const.grid.x = Math.floor( canvasSize.x / cellSize );
    this.const.grid.y = Math.floor( canvasSize.y / cellSize );
  }

  initLayers(){
    this.array.layer.push( new roughDraft() );
  }

  initBorders(){
    let layer = 99;
    let name = 'layerMenu';
    let offset = createVector( cellSize * ( canvasGrid.x - 2.5 ), cellSize * 0.5 );
    let size = createVector( cellSize * 2, cellSize * 2 );
    this.addBorder( layer, name, offset, size );

    this.updateBorders();
  }

  addBorder( layer, name, offset, size ){
    this.array.border.push( new border( this.var.borderID, layer, name, offset, size ));
    this.var.borderID++;
  }

  cleanBorders(){
    for ( let i = 0; i < this.array.border.length; i++ )
      if( this.array.border[i].layer != 99 )
        this.array.border[i].onScreen = false;
  }

  updateBorders(){
    let offsetID = null;
    this.cleanBorders();

    switch ( this.var.layer ) {
      case 0:
        //offsetID = 1;
        //this.array.border[offsetID].onScreen = true;
        break;
    }
  }

  initButtons(){
    let layer;
    let name;
    let type;
    let vec;

    //set layer change buttons
    layer = 99;
    name = 'switchToPictorial';
    type = 0;
    vec = createVector( cellSize * ( canvasGrid.x - 1.5 ), cellSize * 1.5 );
    this.addButton( layer, name, type, vec.copy() );

    for ( let i = 0; i < this.array.button.length; i++ )
      if( this.array.button[i].layer == 99 )
        this.array.button[i].onScreen = true;

    this.updateButtons();
  }

  addButton( layer, name, type, center ){
    this.array.button.push( new button( this.var.buttonID, layer, name, type, center ));
    this.var.buttonID++;
  }

  cleanButtons(){
    for ( let i = this.const.menuButtons; i < this.array.button.length; i++ )
        this.array.button[i].onScreen = false;
  }

  updateButtons(){
    this.cleanButtons();

    let offsetID = null;
    let count = null;

    switch ( this.var.layer ) {
      case 0:
          break;
      }
  }

  update(){
    this.updateButtons();
    this.updateBorders();
  }

  buttonClickCheck(){
    let x = mouseX;// - this.offset.x;
    let y = mouseY;// - this.offset.y;
    let vec = createVector( x, y );
    let minDist = infinity;
    let buttonID = null;

    for( let i = 0; i < this.array.button.length; i++ )
      if ( vec.dist( this.array.button[i].center ) < minDist ){
        minDist = vec.dist( this.array.button[i].center );
        buttonID = i;
      }
    if ( minDist > cellSize / 2 || !this.array.button[buttonID].onScreen )
        return;

    //change board layer
    if( buttonID >= 0 && buttonID < 10 )
      this.switchLayer( buttonID );

    this.update();
  }

  click(){
    this.buttonClickCheck();
    this.array.layer[this.var.layer].click();
  }

  switchLayer( buttonID ){
    let buttonOffset = 0;
    this.var.layer = buttonID - buttonOffset;
  }

  //drawing game frame
  draw(){
    //draw borders
    for( let i = 0; i < this.array.border.length; i++ )
      this.array.border[i].draw( this.var.layer );

    //draw layer
    this.array.layer[this.var.layer].draw();

    //draw buttons
    for( let i = 0; i < this.array.button.length; i++ )
      this.array.button[i].draw( this.var.layer );
  }
}
