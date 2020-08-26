class button {
  constructor ( index, layer, name, type, center ){
    this.layer = layer;
    this.name = name;
    this.type = type;
    this.center = center;
    this.color = color( colorMax / 2 );
    this.const = {
      index: index,
      a: cellSize,
      d: cellSize * 1,
      r: cellSize * 0.4,
      n: 5,
      m: 8
    };
    this.array = {
      vertex: []
    }
    this.description = null;
    this.onScreen = true;

    this.initVertexs();
  }

  initVertexs(){
    for( let i = 0; i < this.const.m; i ++ ){
      this.array.vertex.push([]);
      for( let j = 0; j < this.const.n; j ++ ){
        let angle = Math.PI * 2 / this.const.n *  j - Math.PI - Math.PI/4 * i;
        let r = this.const.a / 4;
        if ( j == 0 )
          r *= 2;
        let x = this.center.x + Math.sin( angle ) * r;
        let y = this.center.y + Math.cos( angle ) * r;
        let vec = createVector( x, y );
        this.array.vertex[i].push( vec.copy() );
      }
    }
  }

  setDescription( txt ){
    this.description = txt;
  }

  draw( layer ){
    if ( ( this.layer == layer || this.layer == 99 ) && this.onScreen ){
      let d = null;

      //draw layer change buttons
      if ( this.type > -1 && this.type < 10 ){
        noStroke();
        switch ( this.type ) {
          case 0:
            fill( 340, colorMax * 1, colorMax * 0.5 );
            break;
          case 1:
            fill( 150, colorMax * 1, colorMax * 0.5 );
            break;
          case 2:
            fill( 50, colorMax * 1, colorMax * 0.5 );
            break;
          case 3:
            fill( 220, colorMax * 1, colorMax * 0.5 );
            break;
          case 4:
            fill( 300, colorMax * 1, colorMax * 0.5 );
            break;
        }

        rect(
          this.center.x - this.const.a / 2,
          this.center.y - this.const.a / 2,
          this.const.a, this.const.a
        );
      }

      if ( this.type == 10 ){
        noStroke();
        fill( 'purple' );
        rect(
          this.center.x - this.const.a * 0.75,
          this.center.y - this.const.a / 2,
          this.const.a * 1.5 , this.const.a
        );
        fill( 0 );
        let txt = 'Next';
        text( txt, this.center.x, this.center.y + fontOffset );
      }
    }
  }
}
