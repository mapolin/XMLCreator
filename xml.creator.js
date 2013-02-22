/* Create XML markup
 * Author: Martin Atzinov
 * Version: 1.0
 */
function XMLCreator() {
    return {
        version: '1.0',
        head: '<?xml version="1.0" encoding="iso-8859-1" ?>', // XML heading, encoding etc
        indent: '    ', // symbols to use for Identation
        nodes: [], // Nodes stack
        masterNode: null, // Master node, the outermost container
        id: -1, // ID - we start with -1 so we can ++ directly
        // Create a node and store it inside the local 'nodes' array
        // @param{string} Name - The name of the node;
        // @param{anything :|, node} Value - can be anything, if a Node is given it will be nested inside it
        // TBD! @param{object} Attributes - Object of properties (ex. {width: 100, index: 10})
        createNode: function(name, value, attributes) {
            // If no name is given - bail
            if(!name) return;

            // Make sure all arguments are either NULL or REAL
            for(var i = 1; i < arguments.length; i++) {
                if(!arguments[i]) arguments[i] = null;
            }

            /* TODO: ATTRIBUTES */

            // Increase the ID of the node with 1
            this.id++;

            // Create the Opening and Closing tags of the node
            var oNode = '<' + name + '>';
            var cNode = '</' + name + '>';

            // Return the Node object
            return {
                ID: this.id, // ID of the Node - used for deletion or direct access
                open: oNode, // Opening tag of the node
                close: cNode, // Closing tag of the node
                value: value || [], // Value of the node - simple value or array of Nodes
                attr: attributes || {} // Attributes of the node - Attributes {} or empty {}
            };
        },
        // Append(nest) a Node to other Node
        // @param{number, node} to - The host Node (either ID or Node)
        // @param{number, node} node - The node to append (either ID or Node)
        appendNode: function(to, node) {
            // If both arguments are IDs
            // Find the corresponding nodes in the Nodes stack
            // do the appending and remove the old node
            if(typeof to == 'number' && typeof node == 'number') {
                this.nodes[to].value.push(this.nodes[node]);
                this.deleteNode(node);
            }
            // If to is ID - find it in the Nodes Stack and append the new node
            else if(typeof to == 'number') {
                this.nodes[to].value.push(node);
            }
            // If node is ID - find it and append it to the newly created Parent node
            // Remove the old node
            else if(typeof node == 'number') {
                to.value.push(this.nodes[node]);
                this.deleteNode(node);
            }
            // If all else fails, use the two newly created nodes
            else {
                to.value.push(node);
            }
        },
        // Delete a node
        // @param{number} id - the ID of the node
        deleteNode: function(id) {
            this.nodes[id] = null;
        },
        // Refresh the Nodes stack
        // In case of removal, a null node will remain,
        // loop through the stack, find any null nodes and push the 'next-in-line' node.
        // At last all NULL nodes will be at the end and we know the amount of real nodes.
        // Recreate the Nodes stack without the unnecessary null nodes
        refreshNodes: function() {
            var i;
            for(i = 0; i < this.nodes.length; i++) {
                if(!this.nodes[i] && i < this.nodes.length-1) {
                    this.id--;
                    this.nodes[i] = this.nodes[i+1];
                    this.nodes[i+1] = null;
                }
                else if(!this.nodes[i] && i == this.nodes.length-1) {
                    break;
                }
            }
            this.nodes = this.nodes.splice(0, i);
        },
        // Parse a level(same depth) of nodes. Recursive!
        // @param{Nodes Stack} nodes - Nodes stack to go through;
        // @param{number} indent - the amount of spaces used for indentation
        // return: String - string representation of the Nodes stack (with newlines and indentations)
        parseLevel: function(nodes, indent) {
            // assign some variables
            var spacer = '';
            var tempResult = '';

            // calculate the needed indentation
            while(spacer.length < indent) {
                spacer += ' ';
            }

            // Go through the current Nodes stack level
            for(var n = 0; n < nodes.length; n++) {
                // If the current node's value is not and object (no nesting inside)
                // write the opening tag, the value, the closing tag and a newline
                if(typeof nodes[n].value == 'string') {
                    tempResult += spacer + nodes[n].open + nodes[n].value + nodes[n].close + '\n';
                }
                // If the value is object - recursively go deeper and deeper until the condition on top is true,
                // on recursion, a string with the current String version of the level is returned
                // finally write the closing tag
                else {
                    tempResult += spacer + nodes[n].open + '\n';
                    tempResult += (this.parseLevel(nodes[n].value, spacer.length * 2));
                    tempResult += spacer + nodes[n].close + '\n';
                }
            }

            // return the String version of the Nodes stack (or current level if recursion)  
            return tempResult;
        },
        parseToXML: function() {
            // Set the header
            this.result = this.head + '\n';

            // Set the very first line of the file, usually the outermost container
            this.result += this.masterNode.open + '\n';

            // Append all Nodes (recursively) and nest them properly
            this.result += this.parseLevel(this.nodes, this.indent.length);

            // Close the outermost container
            this.result += this.masterNode.close;

            // Return the final String result for further use
            return this.result;
        }
    };
};
