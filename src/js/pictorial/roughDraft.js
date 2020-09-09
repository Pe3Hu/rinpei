//
class roughDraft{
  constructor(){
    this.const = {
      a: cellSize
    };
    this.var = {
      l: 1, //3,
      timer: 0,
      target: 0
    };
    this.array = {
      bespoke: [],
      lookuptable: [],
      offset: []
    };
    this.data = {
      gild: null
    }

    this.init();
  }

  init(){
    this.data.gild = new gild();
    this.initOffsets();
    this.initLookUpTable();
    this.generateBespokes();
  }

  initOffsets(){
    this.array.offset.push( createVector( canvasGrid.x / 2 * cellSize, canvasGrid.y / 2 * cellSize) )
  }

  initLookUpTable(){
    // 0 -
    this.array.lookuptable = [ [], [] ];
  }

  generateBespokes(){
    this.array.bespoke = [];
    for( let index = 0; index < this.var.l; index++ ){
      let type = 1;
      let offset = this.array.offset[0].copy();
      let n = 3;
      if( this.var.l > 3 )
        n = this.var.l;
      let a = Math.floor( ( canvasGrid.x - 3 ) / n );
      offset.x += ( index - ( this.var.l - 1 ) / 2  ) * a * cellSize;
      this.array.bespoke.push( new bespoke( index, type, offset, a / 2 ) );
    }
  }

  nextTick(){
    if( this.var.target >= this.var.l )
      return;

    let barrel = 1600;
    this.var.timer++;
    if( this.var.timer % 10 == 0 ){
      this.array.bespoke[this.var.target].fillTank( barrel );
      if( this.array.bespoke[this.var.target].var.full )
        this.var.target++;
      //console.log( this.var.timer )
    }
  }

  click(){

  }

  draw(){
    for( let i = 0; i < this.array.bespoke.length; i++ )
      this.array.bespoke[i].draw();

    this.nextTick();
  }
}
