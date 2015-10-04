/**
 * Created by Daniel on 21.07.15.
 */

CmdSetMaterialMap = function ( object, mapName, newMap ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterialMap';
	this.name = 'Set Material.' + mapName;

	this.object = object;
	this.mapName = mapName;
	this.oldMap = ( object !== undefined ) ? object.material[ mapName ] : undefined;
	this.newMap = newMap;

	this.objectUuid = ( object !== undefined ) ? object.uuid : undefined;
	this.newMapJSON = serializeMap( this.newMap );
	this.oldMapJSON = serializeMap( this.oldMap );

	// serializes a map (THREE.Texture)

	function serializeMap ( map ) {

		if ( map === null || map === undefined ) return null;

		var meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {}
		};

		var json = map.toJSON( meta );
		var images = extractFromCache( meta.images );
		if ( images.length > 0 ) json.images = images;
		json.sourceFile = map.sourceFile;

		return json;

	}

	// Note: The function 'extractFromCache' is copied from Object3D.toJSON()

	// extract data from the cache hash
	// remove metadata on each item
	// and return as array
	function extractFromCache ( cache ) {

		var values = [];
		for ( var key in cache ) {

			var data = cache[ key ];
			delete data.metadata;
			values.push( data );

		}
		return values;

	}

};

CmdSetMaterialMap.prototype = {

	init: function () {

		if ( this.object === undefined ) {

			this.object = this.editor.objectByUuid( this.objectUuid );

		}
		if ( this.oldMap === undefined ) {

			this.oldMap = parseTexture( this.oldMapJSON );

		}
		if ( this.newMap === undefined ) {

			this.newMap = parseTexture( this.newMapJSON );

		}

		function parseTexture ( json ) {

			var map = null;
			if ( json !== null ) {

				var loader = new THREE.ObjectLoader();
				var images = loader.parseImages( json.images );
				var textures  = loader.parseTextures( [ json ], images );
				map = textures[ json.uuid ];
				map.sourceFile = json.sourceFile;

			}
			return map;

		}

	},

	execute: function () {

		this.init();

		this.object.material[ this.mapName ] = this.newMap;
		this.object.material.needsUpdate = true;
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	undo: function () {

		this.init();

		this.object.material[ this.mapName ] = this.oldMap;
		this.object.material.needsUpdate = true;
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.mapName = this.mapName;
		output.oldMap = this.oldMapJSON;
		output.newMap = this.newMapJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.mapName = json.mapName;
		this.oldMapJSON = json.oldMap;
		this.newMapJSON = json.newMap;

	}

};
