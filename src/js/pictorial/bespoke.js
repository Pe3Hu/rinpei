//
class bespoke{
  constructor( index, type, center, a, tank ){
    this.const = {
      index: index,
      center: center,
      a: cellSize * a
    };
    this.var = {
      segment: null,
      type: type,
      tank: 600,
      fullness: {
        current: 0,
        max: 60
      },
      unit: null,
      hatch: null,
      full: false
    };
    this.array = {
      vertex: [ [], [] ]
    };

    this.init();
  }

  init(){
    this.var.unit = Math.floor( this.var.tank / this.var.fullness.max );
    this.initVertexs();
    this.setHatch( 1 )
  }

  initVertexs(){
    if( this.var.type == 0 )
      return;

    let n = this.var.type + 2;
    let angle = -PI * 2 / n;
    let l = this.const.a;

    for( let i = 0; i < n; i++ ){
       let vertex = this.const.center.copy();
       let x = Math.sin( angle * -i );
       let y = -Math.cos( angle * -i );
       let addVec = createVector( x * l, y * l );
       vertex.add( addVec );
       this.array.vertex[0].push( vertex.copy() );
       vertex = this.const.center.copy();
       addVec = createVector( x, y );
       this.array.vertex[1].push( addVec.copy() );
     }
  }

  setHatch( hatch ){
    this.var.hatch = hatch;
  }

  fillTank( barrel ){
    if( this.var.full )
      return;

    let left = this.var.fullness.max - this.var.fullness.current;
    let refill = Math.floor( barrel / this.var.unit );
    let surplus = 0;
    this.var.fullness.current += refill;

    if( this.var.fullness.current >= this.var.fullness.max ){
      this.var.fullness.current = this.var.fullness.max;
      surplus = barrel - left * this.var.unit;
      this.var.full = true;
    }
    console.log( surplus, this.var.unit )
  }

  draw(){
    let txt, koef = this.const.a / this.var.fullness.max * this.var.fullness.current;
    stroke( 'green' );
    fill( 'green' )

    if( this.var.type == 0 )
      ellipse( this.const.center.x, this.const.center.y, this.const.a );
    else
      for( let i = 0; i < this.array.vertex[0].length; i++ ){
        let ii = ( i + 1 ) % this.array.vertex[0].length;

        strokeWeight(2);
        line( this.array.vertex[0][i].x, this.array.vertex[0][i].y,
          this.array.vertex[0][ii].x, this.array.vertex[0][ii].y );


        switch ( this.var.hatch ) {
          case 0:
            strokeWeight(1);
            triangle(
              this.const.center.x + this.array.vertex[1][i].x * koef, this.const.center.y + this.array.vertex[1][i].y * koef,
              this.const.center.x + this.array.vertex[1][ii].x * koef, this.const.center.y + this.array.vertex[1][ii].y * koef,
              this.const.center.x, this.const.center.y,
            );
            break;
        }
      }
  }
}
