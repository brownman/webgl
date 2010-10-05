var Texture = Class.create({
  /* By default, a GL_TEXTURE_2D is generated. Set #target if you need something different. */
  initialize: function(path_or_image) {
    var self = this;
    self.texture = null;
    self.min_filter = GL_LINEAR_MIPMAP_NEAREST;
    self.mag_filter = GL_LINEAR;
    self.target = GL_TEXTURE_2D;
    
    logger.attempt("Texture#initialize", function() {
      if (typeof(path_or_image) == 'string') {
        self.path = path_or_image;
        var img = new Image();
        img.onload = function() { self.handleTextureData(img); };
        img.src = self.path;
      }
      else
      {
        self.path = path_or_image.src;
        if (path_or_image.complete) self.handleTextureData(path_or_image);
        else path_or_image.onload = function() { self.handleTextureData(path_or_image); };
      }
    });
  },
  
  handleTextureData: function(image) {
    var self = this;
    self.image = image;
    logger.attempt("Texture#handleTextureData", function() {
      if (self.onload) self.onload(image);
    });
  },
  
  generateTexture: function(context, image, texture) {
    /*
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);  
    gl.generateMipmap(gl.TEXTURE_2D);
    */
    context.gl.bindTexture(this.target, texture);  
    context.gl.texImage2D(this.target, 0, GL_RGBA, GL_RGBA, GL_UNSIGNED_BYTE, image);
    context.gl.texParameteri(this.target, GL_TEXTURE_MAG_FILTER, this.mag_filter);  
    context.gl.texParameteri(this.target, GL_TEXTURE_MIN_FILTER, this.min_filter);  
    context.gl.generateMipmap(this.target);  
    context.gl.bindTexture(this.target, null);
  },
  
  /* Binds this texture to the given context.
  
    If a callback is given, the texture will be bound and then unbound after the callback is triggered. If no callback
    is given, the texture will be bound to the given context so you can begin drawing.
    
    Examples:
      texture.bind(context);
      // draw stuff
      
      
      texture.bind(context, function() {
        // draw stuff
      });
      // texture is unbound
   */
  bind: function(context, func) {
    var gl = context.gl;
    var isLoaded = this.isLoaded();
    
    if (!this.glTexture)
    {
      if (isLoaded) // loaded but not prepared
      {
        this.glTexture = gl.createTexture();
        this.generateTexture(context, this.image, this.glTexture)
      }
    }
    
    if (isLoaded) gl.bindTexture(this.target, this.glTexture);
    if (func) {
      func();
      if (isLoaded) gl.bindTexture(this.target, null);
    }
  },
  
  isLoaded: function() {
    return (this.glTexture || (this.image && this.image.complete));
  }
});

Texture.all = Texture.all || [];
Texture.find_or_create = function(path) {
  return Texture.all[path] || (Texture.all[path] = new Texture(path));
};