/**
 * Created by Daniel on 20.07.15.
 */

CmdMoveObject = function ( object, newParent, newBefore ) {

	Cmd.call( this );

	this.type = 'CmdMoveObject';
	this.name = 'Move Object';

	this.object = object;
	this.objectUuid = ( object !== undefined ) ? object.uuid : undefined;

	this.oldParent = ( object !== undefined ) ? object.parent : undefined;
	this.oldParentUuid = ( this.oldParent !== undefined ) ? this.oldParent.uuid : undefined;
	this.oldIndex = ( this.oldParent !== undefined ) ? this.oldParent.children.indexOf( this.object ) : undefined;

	this.newParent = newParent;
	this.newParentUuid = ( newParent !== undefined ) ? newParent.uuid : undefined;

	if ( newBefore !== undefined ) {

		this.newIndex = ( newParent !== undefined ) ? newParent.children.indexOf( newBefore ) : undefined;

	} else {

		this.newIndex = ( newParent !== undefined ) ? newParent.children.length : undefined;

	}

	if ( this.oldParent === this.newParent && this.newIndex > this.oldIndex ) {

		this.newIndex --;

	}

	this.newBefore = newBefore;

};

CmdMoveObject.prototype = {

	init: function () {

		if ( this.object === undefined ) {

				this.object = this.editor.objectByUuid( this.objectUuid );

		}
		if ( this.oldParent === undefined ) {

			this.oldParent = this.editor.objectByUuid( this.oldParentUuid );

		}
		if ( this.newParent === undefined ) {

			this.newParent = this.editor.objectByUuid( this.newParentUuid );

		}

	},

	execute: function () {

		this.init();

		this.oldParent.remove( this.object );

		var children = this.newParent.children;
		children.splice( this.newIndex, 0, this.object );
		this.object.parent = this.newParent;

		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.init();

		this.newParent.remove( this.object );

		var children = this.oldParent.children;
		children.splice( this.oldIndex, 0, this.object );
		this.object.parent = this.oldParent;

		this.editor.signals.sceneGraphChanged.dispatch();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.newParentUuid = this.newParentUuid;
		output.oldParentUuid = this.oldParentUuid;
		output.newIndex = this.newIndex;
		output.oldIndex = this.oldIndex;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.oldParentUuid = json.oldParentUuid;
		this.newParentUuid = json.newParentUuid;
		this.newIndex = json.newIndex;
		this.oldIndex = json.oldIndex;

	}

};