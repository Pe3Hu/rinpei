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
      tank: 5400,
      fullness: {
        current: 0,
        max: 60
      },
      unit: null,
      hatch: null,
      full: false
    };
    this.array = {
      vertex: [],
      square: []
    };

    this.init();
  }

  init(){
    this.var.unit = Math.floor( this.var.tank / this.var.fullness.max );
    this.setHatch( 2 );
    this.initVertexs();
  }

  initVertexs(){
    let n = this.var.type + 2;
    let angle = PI * 2 / n;
    let l = this.const.a;

    switch ( this.var.hatch ) {
      case 0:
        if( this.var.type == 0 )
          return;

        this.array.vertex = [ [], [] ];

        for( let i = 0; i < n; i++ ){
           let vertex = this.const.center.copy();
           let x = Math.sin( angle * i );
           let y = -Math.cos( angle * i );
           let addVec = createVector( x * l, y * l );
           vertex.add( addVec );
           this.array.vertex[0].push( vertex.copy() );
           vertex = this.const.center.copy();
           addVec = createVector( x, y );
           this.array.vertex[1].push( addVec.copy() );
         }
        break;
      case 1:
        this.array.vertex = [];
        this.var.segment = n;
        let vertex = this.const.center.copy();
        vertex.y -= l;
        this.array.vertex.push( vertex.copy() );
        //side length of a regular polygon
        let a = l * 2 * Math.sin( PI / n );
        angle = PI / n;

        for( let i = 0; i < n; i++ ){
            let addVec = createVector( Math.sin( PI / 2 - angle  ) * a / this.var.segment, Math.cos( PI / 2 - angle ) * a / this.var.segment );
            for( let j = 0; j < this.var.segment; j++ ){
              vertex.add( addVec );
              this.array.vertex.push( vertex.copy() );
            }
            angle += PI * 2 / n;
        }
        //remove unnecessary repeat
        this.array.vertex.pop();
        this.var.fullness.max = n * this.var.segment;
        break;
      case 2:
        this.array.vertex = [ [], [], [], [] ];
        this.var.segment = 3;

        for( let i = 0; i < n; i++ ){
          let vertex = this.const.center.copy();
          let x = Math.sin( angle * i );
          let y = -Math.cos( angle * i );
          let addVec = createVector( x * l, y * l );
          vertex.add( addVec );
          this.array.vertex[0].push( vertex.copy() );
        }
        //second & last vertex to draw the first and last column
        this.array.vertex[3].push( this.array.vertex[0][1].copy() );
        this.array.vertex[3].push( this.array.vertex[0][this.array.vertex[0].length - 1].copy() );

        let d = ( this.array.vertex[3][0].x - this.array.vertex[3][1].x ) / this.var.segment;
        let x = this.array.vertex[3][1].x;
        let y1 = null;
        let y2 = null;
        let half = this.array.vertex[0].length / 2;
        let last = this.array.vertex[0].length - 1;
        let pointA, pointB, pointC, pointD, vec1, vec2;
        let square = 0;
        for( let i = 0; i < this.var.segment + 1; i++ ){
          switch ( this.var.type ) {
            case 2:
            case 4:
              if( x < this.array.vertex[0][0].x ){
                pointA = this.array.vertex[0][0];
                pointB = this.array.vertex[0][last];
                pointC = this.array.vertex[0][half + 1];
                pointD = this.array.vertex[0][half];
              }
              else{
                pointA = this.array.vertex[0][0];
                pointB = this.array.vertex[0][1];
                pointC = this.array.vertex[0][half - 1];
                pointD = this.array.vertex[0][half];
              }
              vec1 = this.twoDotsLine( pointA, pointB, x, y1 );
              vec2 = this.twoDotsLine( pointC, pointD, x, y2 );
              this.array.vertex[1].push( vec1 );
              this.array.vertex[2].push( vec2 );
              y1 = null;
              y2 = null;
              break;
          }
          x += d;
        }
        break;
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
    //console.log( surplus, this.var.unit )
  }

  twoDotsLine( dot1, dot2, x, y ){
    if( x == null && y == null )
      return;

    let a = dot1.y - dot2.y;
    let b = dot2.x - dot1.x;
    let c = dot1.x * dot2.y - dot2.x * dot1.y;

    if( x == null )
      x = ( c  + b * y ) / -a;
    if( y == null )
      y = ( c  + a * x ) / -b;

    return createVector( Math.round( x ), Math.round( y ) );
  }

  draw(){
    let txt;
    let koef = this.const.a / this.var.fullness.max * this.var.fullness.current;
    let l = this.const.a;
    stroke( 'green' );
    fill( 'green' );

    switch ( this.var.hatch ) {
      case 0:
        if( this.var.type == 0 )
          ellipse( this.const.center.x, this.const.center.y, this.const.a );

        for( let i = 0; i < this.array.vertex[0].length; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[0].length;

          strokeWeight(2);
          line( this.array.vertex[0][i].x, this.array.vertex[0][i].y,
            this.array.vertex[0][ii].x, this.array.vertex[0][ii].y );
          strokeWeight(1);

          triangle(
            this.const.center.x + this.array.vertex[1][i].x * koef, this.const.center.y + this.array.vertex[1][i].y * koef,
            this.const.center.x + this.array.vertex[1][ii].x * koef, this.const.center.y + this.array.vertex[1][ii].y * koef,
            this.const.center.x, this.const.center.y
          );
        }


        break;
      case 1:
        for( let i = 0; i < this.array.vertex.length; i+=this.var.segment ){
          let ii = ( i + this.var.segment ) % this.array.vertex.length;

          strokeWeight(2);
          line( this.array.vertex[i].x, this.array.vertex[i].y,
            this.array.vertex[ii].x, this.array.vertex[ii].y );
          strokeWeight(1);
        }

        for( let i = 0; i < this.var.fullness.current; i++ ){
          let ii = ( i + 1 ) % this.array.vertex.length;

          triangle(
            this.array.vertex[i].x, this.array.vertex[i].y,
            this.array.vertex[ii].x, this.array.vertex[ii].y,
            this.const.center.x, this.const.center.y
          );
        }
        break;
      case 2:
        for( let i = 0; i < this.array.vertex[0].length - 1; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[0].length;

          strokeWeight(2);
          line( this.array.vertex[0][i].x, this.array.vertex[0][i].y,
            this.array.vertex[0][ii].x, this.array.vertex[0][ii].y );
          strokeWeight(1);
        }

        strokeWeight(2);
        stroke('red')
        line( this.array.vertex[3][0].x, this.const.center.y + l,
          this.array.vertex[3][1].x, this.const.center.y + l );
        line( this.array.vertex[3][0].x, this.array.vertex[0][0].y,
          this.array.vertex[3][1].x, this.array.vertex[0][0].y );

        strokeWeight(0.5)
        stroke('green');
        let pointA, pointB, pointC, pointD;
        for( let i = 0; i < 3; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[1].length;

          if( this.var.segment % 2 == 1 && i == Math.floor( this.var.segment / 2 ) ){
            //edit this
            let half = this.array.vertex[0].length / 2;
            pointA = this.array.vertex[0][0];
            pointD = this.array.vertex[0][half];
            pointB = this.array.vertex[1][i];
            pointC = this.array.vertex[2][i];

            triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y );
            triangle( pointA.x, pointA.y, pointC.x, pointC.y, pointD.x, pointD.y );

            pointB = this.array.vertex[1][ii];
            pointC = this.array.vertex[2][ii];
          }
          else{
            pointA = this.array.vertex[1][ii];
            pointB = this.array.vertex[1][i];
            pointC = this.array.vertex[2][i];
            pointD = this.array.vertex[2][ii];
          }

          triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y );
          triangle( pointA.x, pointA.y, pointC.x, pointC.y, pointD.x, pointD.y );
        }
        break;
      }

    noStroke();
    fill('black')
    ellipse( this.const.center.x, this.const.center.y, this.const.a/6 );
  }
}
