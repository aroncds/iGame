/*
 * iGame Framework - HTML5
 * author: Aron Castro
 */

var iGame = {};

iGame.Basic = {
    canvas: null,
    fps:0,
    width:0,
    height:0,
    event:null
};

iGame.init = function(canvas, width, height, fps){
    iGame.Basic.canvas = canvas;
    iGame.Basic.fps = 1000/fps;
    iGame.Basic.width = width;
    iGame.Basic.height = height;
    
    canvas.width = width;
    canvas.height = height;
    
    iGame.Basic.event = new iGame.Event();
    
    iGame.Update();
    
    console.log("iGame Framework 1.0 \nAuthor: Aron de Castro");
};

iGame.Update = function(){
    iGame.Basic.event.dispatchEvent("enterFrame");
    setTimeout(iGame.Update, iGame.Basic.fps);
};

//Classe para Determinar positions
iGame.Vector2 = function(x, y){
	this.X = x;
	this.Y = y;
	
	this.distance = function(position){
		return Math.sqrt(Math.pow(this.X - position.X,2) + Math.pow(this.Y-position.Y,2));
	};
};

//Classe Objeto Basico
iGame.Object = function(){
        iGame.Event.apply(this);
	this.position = new iGame.Vector2(0,0);
	this.scale = new iGame.Vector2(1,1);
	this.rotate = 0;
	this.alpha = 1;
	this.stage = null;
	this.parent = null;
	this.type = "Obejct";
        this.pivot = new iGame.Vector2(0,0);
        this.visible = true;
        
        //box2d body
        this.b2Body = null;
        this.box2D = false;
        
        this.addB2Body=function(obj){
          this.b2Body = obj;
          this.box2D = true;
          this.position = this.b2Body.m_position;
          this.rotate = this.b2Body.m_rotation;
        };
        
        this.removeB2Body = function(){
            this.b2Body = null;
            this.box2D = false;
        };
	
	this.beginDraw = function(){
		this.stage.ctx.save();
                if(this.box2D && this.b2Body!==null){
                    this.stage.ctx.translate(this.position.x, this.position.y);
                    this.stage.ctx.rotate(this.b2Body.GetRotation());
                }else{
                    this.stage.ctx.translate(this.position.X, this.position.Y);
                    this.stage.ctx.rotate(this.rotate);
                }
                this.stage.ctx.globalAlpha = this.alpha;
		this.stage.ctx.scale(this.scale.X, this.scale.Y);
	};
	
	this.endDraw = function(){
		this.stage.ctx.restore();
	};
	
	this.setStage = function(stage){
		this.stage = stage;
	};
};

// Classe Node para criar Camadas
iGame.Node = function(){
	iGame.Object.apply(this);
	
	var objetos = new Array();
	this.type = "Node";
        this.visible = true;
	 
	this.NumberChild = function(){
		return objetos.length;
	};
	
	this.setStage = function(stage){
		this.stage = stage;
		for(var i = 0; i < objetos.length; i++){
			objetos[i].setStage(this.stage);
		}
	};
	
	this.addChild = function(object){
		if(object.type !== undefined){
			object.parent = this;
			if(this.type === "Stage")object.setStage(this); else object.setStage(this.stage);
			objetos.push(object);
		}
	};
	
	this.removeChild = function(object){
		for(var i=0;i < objetos.length;i++){
			if(objetos[i] === object){
				objetos.splice(i, 1);
				break;
			}
		}
		return false;
	};
	
	this.contains = function(object){
		objetos.forEach(function(obj){
			if(obj === object){
				return true;
			}
		});
		return false;
	};
	
	this.draw = function(){
		if(this.stage !== null && this.visible){
			this.beginDraw();
			for(var i = 0; i < objetos.length; i++){
                            if(objetos[i].visible)
				objetos[i].draw();
			}
			this.endDraw(); 
		}
	};
        
        this.Clear = function(){
            objetos = new Array();
        };
	
	this.update = function(){};
};

//Classe para criar um retangulo
iGame.Rect = function(parameters){
	iGame.Object.apply(this);
	
	this.position = new iGame.Vector2(parameters.X | 0, parameters.Y | 0);
	this.width = parameters.width || 1;
	this.height = parameters.height || 1;
        this.fillcolor = parameters.color ||"black";
	this.type = "Rect";
	
	this.draw = function(){
		this.beginDraw();
		this.stage.ctx.fillStyle = this.fillcolor;
		this.stage.ctx.fillRect(this.pivot.X,this.pivot.Y, this.width, this.height);
		this.endDraw();
	};
};

//Classe Para o display
iGame.Stage = function(){
	iGame.Node.apply(this);
	
	this.canva = iGame.Basic.canvas;
	this.ctx = this.canva.getContext('2d');
	this.stage = this;
	this.type = "Stage";
	this.stageWidth = this.canva.width;
	this.stageHeight = this.canva.height;
	this.mousePosition = new iGame.Vector2(0,0);
	
	var that = this;
	
	this.canva.addEventListener('keydown', function(e){
		that.dispatchEvent('keydown', e);
	});
	
	this.canva.addEventListener('keyup', function(e){
		that.dispatchEvent('keyup', e);
	});
	
	this.canva.addEventListener('mousedown', function(e){
		that.dispatchEvent('mousedown', e);
	});
	this.canva.addEventListener('mousemove', function(e){
                that.mousePosition = new iGame.Vector2(e.offsetX, e.offsetY);
		that.dispatchEvent('mousemove', that.mousePosition);
		
	});
	
	this.canva.addEventListener('mouseup', function(e){
		that.dispatchEvent('mouseup', e);
	});
        
        this.canva.addEventListener('click', function(e){
                that.dispatchEvent('click', e);
        });
        
	// box2d world
        this.world = null;
        
	var Update = function (){
            if(that.world !== null)
                that.world.Step(1.0/60,1);
	};
	
	var Draw = function(){
		that.draw();
	};
	
	this.Tick = function(){
		that.ctx.clearRect(that.position.X, that.position.Y, that.position.X + that.stageWidth, that.position.Y + that.stageHeight);
		Update();
                Draw();
	};
	
        
        this.init = function(){
            iGame.Basic.event.addEventListener("enterFrame", that.Tick);
            document.webkitFullscreenElement = iGame.Basic.canvas;
            document.webkitIsFullscreen = true;
            iGame.Basic.canvas.webkitRequestFullscreen();
        };
       
};

//Classe Sprite
iGame.Sprite = function(par){
	iGame.Object.apply(this);
	
	var image = par.image || new Image();
        
        if(par.srcImage !== undefined)
            image.src = par.srcImage;
        
        this.width = image.width;
        this.height = image.height;
        
	this.getImage = function(){
		return image;
	};
	
	this.draw = function(){
		this.beginDraw();
			this.stage.ctx.drawImage(this.getImage(), this.pivot.X,this.pivot.Y, image.width, image.height);
		this.endDraw();
	};
};

//Classe SpriteTIle - Animations
iGame.SpriteTile = function(par){
	iGame.Sprite.apply(this, arguments);
        
        this.type="spritetile";
	
	this.tileIndex1D = 0;
	this.tileIndex2D = new iGame.Vector2(0,0);
	
        this.unitsX = par.x || 1;
        this.unitsY = par.y || 1;
        this.maxframes = this.unitsX * this.unitsY;
       	this.tileWidth = parseInt(this.width / this.unitsX);
	this.tileHeight = parseInt(this.height / this.unitsY);
        
	this.draw = function(){
		this.beginDraw();
			this.stage.ctx.drawImage(this.getImage(), this.tileIndex2D.X * this.tileWidth, this.tileIndex2D.Y * this.tileHeight, this.tileWidth, this.tileHeight, this.pivot.X,this.pivot.Y, this.tileWidth, this.tileHeight); 
		this.endDraw();
	};
        
        this.gotoAndStop = function(n){
            this.tileIndex2D.X = n;
        };
       
        this.update = function(){
            if(this.tileIndex1D !== this.maxFrames-1){
                this.tileIndex1D ++;
                if(this.tileIndex2D.X === this.unitsX-1){
                    this.tileIndex2D.X = 0;
                }else this.tileIndex2D.X ++;
            }else{
                this.tileIndex1D = 0;
            }
        };
};

iGame.Text = function(parameters){
    iGame.Object.apply(this);
    
    var color = parameters.color || "Black";
    var text = parameters.text;
    var currentText = parameters.text;
    var font = (parameters.size || "20")+"px " + (parameters.font || "arial");
    var align = parameters.align || "start";
    var currentadd = 0;
    var currentTimer = 0;
    
    this.draw = function(){
        this.beginDraw();
            this.stage.ctx.textAlign = align;
            this.stage.ctx.font = font;
            this.stage.ctx.fillStyle = color;
            this.stage.ctx.fillText(currentText, this.position.X , this.position.Y);
        this.endDraw();
    };
    
    this.addLetterBySecond = function(){
        currentText = "";
        iGame.Basic.event.addEventListener("enterFrame", UpdateLetter);
    };
    
    var UpdateLetter = function(){
           currentTimer += iGame.Basic.fps;
           if(currentTimer > iGame.Basic.fps*2){
                if(currentadd < text.length){
                    currentText += text[currentadd];
                    currentadd++;
                }else{
                    iGame.Basic.event.removeEventListener("enterFrame", UpdateLetter);
                }
           }
    };
};

iGame.Line = function(parameters){
    iGame.Object.apply(this);
    
    var lines = parameters.lines || new Array();
    var that = this;
    
    this.addPointLine = function(x,y){
        lines.push(new iGame.Vector2(x,y));
    };
    
    this.draw = function(){
        this.beginDraw();
        this.stage.ctx.beginPath();
        that.stage.ctx.moveTo(0,0);
            lines.forEach(function(obj){
               that.stage.ctx.lineTo(obj.X,obj.Y); 
            });
        that.stage.ctx.stroke();
        this.stage.ctx.closePath();
        this.endDraw();
    };
};

iGame.Tween = function(obj){
    iGame.Event.apply(this);
    
    var that  = this;
    this._obj = obj;
    var properties = new Array();
    var running = true;
    
    this.play = function(){
        running = true;
    };
    
    this.stop = function(){
        running = false;
    };
    
    var animationVel = function(newpos, currentpos, totalTimer){
        var x = newpos.X - currentpos.X;
        var y = newpos.Y - currentpos.Y;
        var velX = (x/totalTimer) * iGame.Basic.fps;       //(x * (fps / (totalTimer * 0.001)));
        var velY = (y/totalTimer) * iGame.Basic.fps;        //(y * (fps / (totalTimer * 0.001)));
        return new iGame.Vector2(velX,velY); 
    };
    
    this.moveTo = function(newposition, timer){
        var vel = animationVel(newposition,this._obj.position, timer);
        properties["move"] = {totalTimer:timer,currentTimer:0,vel:vel,type:"move"};
        iGame.Basic.event.addEventListener("enterFrame", moveupdate);
        running = true;
    };
    
    this.scaleTo = function(newscale, timer){
        var vel = animationVel(newscale,this._obj.scale, timer);
        properties["scale"] = {totalTimer:timer,currentTimer:0,vel:vel,type:"scale"};
        iGame.Basic.event.addEventListener("enterFrame", scaleupdate);
        running = true;
    };
    
    var moveupdate = function(){
        if(running){
            that._obj.position.X += properties["move"].vel.X;
            that._obj.position.Y += properties["move"].vel.Y;
            properties["move"].currentTimer += iGame.Basic.fps;
        }
        
        if(properties["move"].currentTimer > properties["move"].totalTimer){
            iGame.Basic.event.removeEventListener("enterFrame", moveupdate);
            currentTimer = 0;
            running= false;
            properties["move"].currentTimer = 0;
            that.dispatchEvent("TweenComplete", "move");
        }
    };
    
    var scaleupdate = function(){
        if(running){
            that._obj.scale.X += properties["scale"].vel.X;
            that._obj.scale.Y += properties["scale"].vel.Y;
            properties["scale"].currentTimer += iGame.Basic.fps;
        }
        
        if(properties["scale"].currentTimer > properties["scale"].totalTimer){
            iGame.Basic.event.removeEventListener("enterFrame", scaleupdate);
            that.dispatchEvent("TweenComplete", "scale");
            running = false;
            properties["scale"].currentTimer = 0;
        }
    };
};

iGame.Sequence = function(){
    iGame.Event.apply(this);
    
    var seq = new Array();
    var that = this;
    var current = 0;
    var currentTimer = 0;
    var running = true;
    
    this.addSequence = function(timer, acao){
        seq.push({timer: timer, func: acao});
    };
    
    this.removeAllSequence = function(){
        seq = new Array();
        current = 0;
    };
    
    this.start = function (){
        iGame.Basic.event.addEventListener("enterFrame", that.Update);
        running = true;
    };
    
    this.pause = function(){
        iGame.Basic.event.removeEventListener("enterFrame", that.Update);
        currentTimer = 0;
        running = false;
    };
    
    this.Update = function(){
        if(running){
            currentTimer += 30;

            if(current === seq.length){
               iGame.Basic.event.removeEventListener("enterFrame", that.Update);
               that.dispatchEvent("SequenceComplete");
            }else{
                if(currentTimer > seq[current].timer){
                    seq[current].func();
                    currentTimer = 0;
                    current++;
                }
            }
        }
    };
};

//Classe de Manipula��o de Eventos
iGame.Event = function (){
	var events = new Array();
	
	this.addEventListener = function(type, funcao){
		if(events[type] === undefined){
			events[type] = new Array();
		}
		events[type].push(funcao);
	};
	
	this.removeEventListener = function(type, funcao){
		if(events[type] !== undefined){
			for(var i = 0; i < events[type].length; i++){
                                if(events[type][i] === funcao){
					events[type].splice(i,1);
					break;
				}
			}
		}
	};
	
        this.removeLastEvent = function(type){
            if(events[type] !== undefined && events[type].length > 0){
                events[type].splice(events[type].length-1, 1);
            }
        };
        
	this.dispatchEvent = function(type, ar){
		if(events[type] !== undefined){
			for(var i = 0; i < events[type].length; i++){
                            if(events[type][i] !== undefined)
				events[type][i](ar);
			}
		}
	};
};

iGame.Asset = {
  textures: new Array(),
  songs: new Array(),
  count:0,
  
  loadTexture: function(src,func){
      if(iGame.Asset.textures[src] === undefined){
        iGame.Asset.textures[src] = new Image();
        iGame.Asset.textures[src].src = src;
        iGame.Asset.textures[src].onload = function(){
            iGame.Asset.count++;
            if(func!==undefined) func();
        };
      }else if(func!==undefined) func();
  },
          
  loadSound: function(src,func){
    if(iGame.Asset.songs[src] === undefined){
        iGame.Asset.songs[src] =new Audio();
        iGame.Asset.songs[src].canPlayType("audio/mpeg");
        iGame.Asset.songs[src].src = src;
        iGame.Asset.songs[src].onload = function(){
            iGame.Asset.count++;
            if(func!==undefined) func();
        };
    }  
  },
  
  getSprite: function(src){
      if(iGame.Asset.textures[src] !== undefined){
          return new iGame.Sprite({image:iGame.Asset.textures[src]});
      }
  },
          
  getSpriteTile: function(src,x,y){
     if(iGame.Asset.textures[src] !== undefined){
         return new iGame.SpriteTile({image:iGame.Asset.textures[src], x:x, y:y});
     }
  },
  
  getSound: function(src){
   if(iGame.Asset.songs[src]!==undefined){
       return iGame.Asset.songs[src];
   }   
  },
          
  playSound: function(src, current){
      if(iGame.Asset.songs[src]!==undefined){
          iGame.Asset.songs[src].currentTime = current || 0;
          return iGame.Asset.songs[src].play();
      }
  }
};

iGame.ParticleSystem = function(parameters){
  iGame.Node.apply(this);

  var texture = parameters.texture;
  var count = parameters.count || 1;
  var particles = new Array();
  var maxTimer = parameters.timer || 1000;
  var velRandom = new iGame.Vector2(parameters.velX || 1, parameters.velY || 1);
  var scaleRandom = new iGame.Vector2(parameters.scaleX||1, parameters.scaleY || 1);
  
  this.createParticles = function(){
      for(var i = 0; i < count; i++){
          particles.push(new iGame.Particles({image:texture, vel:velRandom, scale:scaleRandom, timer:maxTimer}));
          this.addChild(particles[i]);
      }
  };
  
  this.Update = function(){    
      particles.forEach(function(obj){
         obj.Update(); 
      });
  };
};

iGame.Particles = function(parameters){
    iGame.Sprite.apply(this,arguments);
    
    var velRandom = new iGame.Vector2(parameters.velX || 1, parameters.velY || 1);
    var currentVelRandom = null;
    var scaleRandom = new iGame.Vector2(parameters.scaleX||1, parameters.scaleY || 1);
    var maxTimer = parameters.timer || 1;
    var currentTimerMax = Math.random() * maxTimer;
    var timer = 0;
    var vel =new iGame.Vector2(Math.random() * (parameters.velX || 1), Math.random() * (parameters.velY || 1));;
    var that = this;
    
    this.init = function(){
        this.scale = new iGame.Vector2(Math.random() * scaleRandom.X + 0.2, Math.random() * scaleRandom.Y + 0.2);
        currentVelRandom =new iGame.Vector2(Math.random() * velRandom.X, Math.random() * velRandom.Y);
        currentTimerMax = Math.random() * maxTimer;
        this.position = new iGame.Vector2(0,0);
        this.alpha = Math.random() * 0.4;
    };
    
    this.Update = function(){
        timer += iGame.Basic.fps;
        
        if(timer >= currentTimerMax){
            timer = 0;
            that.init();
        }
        
        this.position.X += velRandom.X;
        this.position.Y += velRandom.Y;
    };
    
    this.init();
};

iGame.Xml = function(){
    
    this.xml = null;
    this.Node = "Roteiro";
    this.SubNode = "action";
    var that = this;
    
    this.load = function(url){
        var ajax = new XMLHttpRequest();
        ajax.open("GET", url, false);
        ajax.send();
        that.xml = ajax.responseXML;
    };
    
    
    this.getTagName = function(tag){
        return that.xml.getElementsByTagName(this.Node)[0].getElementsByTagName(tag);
    };
};