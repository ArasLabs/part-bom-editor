	//-------------------------------------------------------------------------------------
	// PartsBOMEditor.html
	// 
	// �T�v�F	�I�����ꂽ���i�̍\�������c���[�ŕ\�����A�e�f�[�^�̕ҏW���s���܂��B
	//			�܂��ǉ��A�폜�A�h���b�N���h���b�v���s�����Ƃ��ł��܂��B
	//-------------------------------------------------------------------------------------
		
		//-------------------
		// �萔
		//-------------------
		//���i�A�C�e���^�C�v��
		var TYPE_PART = "Part";
		//���b�N�n�m�A�C�R���N���X��
		var LOCK_ON = "on";
		//���b�N�n�e�e�A�C�R���N���X��
		var LOCK_OFF = "off";
		//�V�K�t���O
		var ADD_ON = "add";
		//�ҏW�t���O
		var EDIT_ON = "edit";
		//���ҏW�t���O
		var GET_ON = "get";
		//�ۑ����̃��b�Z�[�W
		var SUCCESS_MESSAGE = "Parts saved successfully.";

		//-------------------
		// �O���[�o���ϐ�
		//-------------------
		//Aras�I�u�W�F�N�g�ݒ�
		var arasObj = window.dialogArguments.aras;
		//�f�[�^�O���b�h HTML�A�z�z��
		var gridPartDataList = new Array();
		var gridPartBOMDataList = new Array();
		//�f�[�^�O���b�h�̊e�v���p�e�B�E�f�[�^�p�A�z�z��
		var gridPropertyValueList = new Array();
		//BOM�f�[�^�O���b�h�̊e�v���p�e�B�E�f�[�^�p�A�z�z��
		var gridBOMPropertyValueList = new Array();
		//�����[�V�����V�b�vID���L�[�ɁA�A�C�e���h�c��ݒ�
		var itemKeyValuList = new Array();
		//�ǉ������[�V�����V�b�v�p �f�[�^�A�z�z��
		var addRSItemList = new Array();
		//�ړ������[�V�����V�b�v�p �f�[�^�A�z�z��
		var moveRSItemList = new Array();
		//�폜�����[�V�����V�b�v�p �f�[�^�A�z�z��
		var deleteRSItemList = new Array();
		//PARTS�����A�z�z��i�ǉ��A�ҏW�j
		var actionItemList = new Array();
		//�O��I�����ڃA�C�e��ID
		var beforeSelectedItemId;
		//�O��I�����ڃA�C�e��ID(�����[�V�����V�b�v�A�C�e��)
		var beforeSelectedResItemId;
		//�����\���t���O
		var initFlg =0;
		//�����\���t���O
		var lockFlg =0;
		//lock���I���A�C�e���h�c
		var lockItemId;
		//�\�����ڃ��X�g
		var dispList;
		//BOM�\�����ڃ��X�g
		var bomdispList;
		//
		var lockMode;

		//-------------------
		// ��ʃ��[�h���̃c���[�f�[�^�擾����
		// �C�x���g�Fonload
		//-------------------
		window.onload=function() {
			refreshWindow();
		}

		//-------------------
		// ��ʃ��[�h���̃c���[�f�[�^�擾����
		// �C�x���g�Fonload
		//-------------------
		function refreshWindow() {
			// �c���[�̍\���v�f�擾
			var treeData = getItemStructure();
			var treeObj = (new Function("return " + treeData))();
			//jsTree���g�����\��
			$("#tt").jstree({ 
				"json_data" : {
					"data" : [treeObj]
				},
				"types" : {
					// I set both options to -2, as I do not need depth and children count checking
					// Those two checks may slow jstree a lot, so use only when needed
					"max_depth" : -1,
					"max_children" : -1,
					// I want only `drive` nodes to be root nodes 
					// This will prevent moving or creating any other type as a root node
					"valid_children" : ["part"],
					"types" : {
						"default" : {
							// I want this type to have no children (so only leaf nodes)
							// In my case - those are files
							"valid_children" : [ "default", "part", "part-lock", "edit"],
							// If we specify an icon for the default type it WILL OVERRIDE the theme icons
							"icon" : {
								"image" : "../styles/PartsBOMEditor/icon/Part.gif"
							}
						},
						"root" : {
							// can have files and folders inside, but NOT other `drive` nodes
							"valid_children" : [ "default", "part", "part-lock", "edit" ],
							"icon" : {
								"image" : "../styles/PartsBOMEditor/icon/Part.gif"
							},
							// those prevent the functions with the same name to be used on `drive` nodes
							// internally the `before` event is used
							"start_drag" : false,
							"move_node" : false,
							"delete_node" : false,
							"remove" : false
						},
						"part" : {
							// I want this type to have no children (so only leaf nodes)
							// In my case - those are files
							"valid_children" : [ "default", "part", "part-lock", "edit" ],
							// If we specify an icon for the default type it WILL OVERRIDE the theme icons
							"icon" : {
								"image" : "../styles/PartsBOMEditor/icon/Part.gif"
							}
						},
						"part-lock" : {
							// I want this type to have no children (so only leaf nodes)
							// In my case - those are files
							"valid_children" : ["default", "part", "part-lock", "edit"],
							// If we specify an icon for the default type it WILL OVERRIDE the theme icons
							"icon" : {
								"image" : "../styles/PartsBOMEditor/icon/Part-Lock.gif"
							}
						},
						"edit" : {
							// I want this type to have no children (so only leaf nodes)
							// In my case - those are files
							"valid_children" : ["default", "part", "part-lock", "edit"],
							// If we specify an icon for the default type it WILL OVERRIDE the theme icons
							"icon" : {
								"image" : "../styles/PartsBOMEditor/icon/Part-Lock-Change.gif"
							}
						},
						"other-lock" : {
							// I want this type to have no children (so only leaf nodes)
							// In my case - those are files
							"valid_children" : [],
							// If we specify an icon for the default type it WILL OVERRIDE the theme icons
							"icon" : {
								"image" : "../styles/PartsBOMEditor/icon/Part-Other-Lock.gif"
							},
							"start_drag" : false,
							"move_node" : false
						}
					}
				},
				"contextmenu" : {
						"items" : function(node) {
							return {
								"create" : {
									"label" : " New Part",
									"action" : function (obj) { onclickNewPartsAddBtn(this, obj); },
									"separator_before"  : true,
							                "separator_after"   : true,
									"icon" : "../styles/PartsBOMEditor/icon/new.png"
								},
								"Add Item" : {
									"label" : " Add Part",
									"action" : function (obj) { onclickExistPartsAdd(this, obj); },
									"icon" : "../styles/PartsBOMEditor/icon/add.png"
								},
								"remove" : {
									"label" : " Remove Part",
									"action" : function (obj) { onclickRemovePart(this, obj); },
									"icon" : "../styles/PartsBOMEditor/icon/remove.png"
								},
								"lock" : {
									"label" : " Lock",
									"action" : function (obj) { 
										var flag = onclickLockItem($(obj)); 
										if ( flag ) {
											lockMode = "lock";
											var searchData = $("#tt").jstree("search", $(obj).data("disptitle") );
										}
									},
									"icon" : "../styles/PartsBOMEditor/icon/lock.png"
								},
								"unlock" : {
									"label" : " Unlock",
									"action" : function (obj) { 
										var flag = onclickUnlockItem($(obj)); 
										if ( flag ) {
											lockMode = "unlock";
											var searchData = $("#tt").jstree("search", $(obj).data("disptitle") );
										}
										dispEditMode("view"); 
										if ( actionItemList[$(obj).data("id")] ) {
											actionItemList[$(obj).data("id")] = "get";
										}
									},
									"icon" : "../styles/PartsBOMEditor/icon/unlock.png"
								},
								"edit" : {
									"label" : " Edit",
									"action" : function (obj) { 
											var flag = false;
											if ( $(obj).data("lock") == "0" ) {
												flag = onclickLockItem($(obj)); 
											}
											$(obj).attr({"rel" : "edit"}); 
											$(obj).data({"action" : "edit"}); 
											dispEditMode("edit");
											actionItemList[$(obj).data("id")] = "edit";
											if ( flag ) {
												lockMode = "edit";
												var searchData = $("#tt").jstree("search", $(obj).data("disptitle") );
											}
										},
									"icon" : "../styles/PartsBOMEditor/icon/edit.png"
								}
							}
						}
				},
				"core" : {
					"animation" : 0
				},
				"plugins" : [ "core", "themes", "json_data", "ui", "crrm", "dnd", "types", "search", "contextmenu"]
			}).bind("select_node.jstree", 
						function (e, data)
						{ 
							$("#attribute_table").mask("Loading...");
							onClickTree( $(data.rslt.obj) );
							$("#attribute_table").unmask();
						}
			).bind("search.jstree", 
						function (e, data)
						{ 
							$("#tt").jstree("clear_search");
							data.rslt.nodes.parent().each(function () { 
								var nodInfo = $("#" +this.id);
								if ( lockMode == "lock" ) {
									nodInfo.data({"lock":"1"});
									nodInfo.attr({"rel" : "part-lock"});
								}
								else if  (lockMode == "unlock" ) {
									nodInfo.data({"lock":"0"});
									nodInfo.attr({"rel" : "part"});
								}
								else if  (lockMode == "edit" ) {
									nodInfo.data({"lock":"1"});
									nodInfo.data({"action" : "edit"}); 
									nodInfo.attr({"rel" : "edit"});
									actionItemList[nodInfo.data("id")] = "edit";
								}
							}); 
						}
			).bind("move_node.jstree", 
						function (e, data)
						{ 
							// �ړ������A�C�e���ɑ΂���A�e�A�C�e����config_id��A�z�z��Ɋi�[
							// �폜�p
							var relshipList = new Array();
							relshipList["relsId"] = data.rslt.o.data("partbomId");
							relshipList["parentId"] = data.rslt.np.data("configId");
							moveRSItemList[data.rslt.o.data("id")] = relshipList;
						}
			);
			// ���͍��ځA�v���p�e�B����
			document.getElementById("Part").innerHTML = getDispList(""); // getDispList(window.dialogArguments.parent.getID());
			document.getElementById("PartBOM").innerHTML = getRSDispList("");
			// selectTree(window.dialogArguments.parent.getID(), "");
			selectTree("_" + window.dialogArguments.parent.getID(), "");
			$("#tab a:first").tab("show");
			// ��ʕ\����Ԃ̕ҏW��Ԃ��i�[
			actionItemList[treeObj.metadata.id] = treeObj.metadata.action;
			if ( treeObj.children) {
				firstChildTreeData(treeObj);
			}
		}

		function firstChildTreeData(childTreeObj)
		{
			var maxlen = childTreeObj.children.length;
			// �q���i�����݂���ꍇ
			for ( var cnt = 0; cnt < maxlen; cnt++)
			{
				var childObj = childTreeObj.children[cnt];
				actionItemList[childObj.metadata.id] = childObj.metadata.action;
				if ( childObj.children )
				{
					firstChildTreeData(childObj);
				}
			}
			return;
		}

		//
		// �ҏW���[�h�̐؂�ւ�
		// 
		function dispEditMode(mode)
		{
			var flag = true;
			if ( mode == "edit" ) {
				flag = false;
			}
			var dispListNodes = dispList.selectNodes("//Item");
			for ( i = 0; i < dispListNodes.length; i++ )
			{
				var name = dispListNodes[i].selectSingleNode("propertyname").text;
				document.getElementById(name).disabled = flag;
			}
			var bomdispListNodes = bomdispList.selectNodes("//Item");
			for ( i = 0; i < bomdispListNodes.length; i++ )
			{
				var name = bomdispListNodes[i].selectSingleNode("propertyname").text;
				document.getElementById(name).disabled = flag;
			}
		}
		
		//-------------------
		// �\�����ڂ̎擾
		//-------------------
		function getDispList(itemid)
		{
			// ���N�G�X�g���쐬
			var methodAML = "<Item type='" + window.dialogArguments.parent.getType() + "' action='GetItemTreeGridStructureLabel' />";
			//Aras�̃c���[�f�[�^�擾�����Ăяo��
			var res = arasObj.applyMethod("GetItemTreeGridStructureLabel", methodAML);
			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Item(XML)�̃f�[�^�𔲂��o��
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				dispList = xDoc.selectSingleNode("Result");
			}
			return makeEditHtml(itemid, "Part", dispList);
		}
		
		//-------------------
		// �\�����ڂ̎擾
		//-------------------
		function getRSDispList(relationshipid)
		{
			var htmlData = "";
			// BOM���N�G�X�g���쐬
			var methodAML = "<Item type='PART BOM' action='GetItemTreeGridStructureLabel' />";
			//Aras�̃c���[�f�[�^�擾�����Ăяo��
			var res = arasObj.applyMethod("GetItemTreeGridStructureLabel", methodAML);
			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Item(XML)�̃f�[�^�𔲂��o��
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				bomdispList = xDoc.selectSingleNode("Result");
			}
			return makeEditHtml(relationshipid, "Part BOM", bomdispList); 
		}

		//
		//
		//
		//
		function makeEditHtmlWithData(itemid, itemtype, dispListXML, dataList, partid)
		{
			var lockedflag = "disabled='disabled'";
			var itemNode;
			// �A�C�e��ID���ݒ肳��Ă���ꍇ�́A�Ώ�PART�����擾����B
			if ( itemid != "" ) {
				if ( actionItemList[partid] == "edit" ||  actionItemList[partid] == "add") {
					lockedflag = "";
				}
			}
			if ( itemtype != "Part" ) {
				if ( addRSItemList[partid] ) {
					lockedflag = "";
				}
			}

			var editHtml = "<table class='table table-bordered table-hover table-condensed'>";
			// Item�̃m�[�h�i���X�g�j�擾
			var dispListNodes = dispListXML.selectNodes("//Item");
			for ( i = 0; i < dispListNodes.length; i++ )
			{
				editHtml += "<tr>";
				var name = dispListNodes[i].selectSingleNode("name").text;
				var pname = dispListNodes[i].selectSingleNode("propertyname").text;
				var pdiv = dispListNodes[i].selectSingleNode("pdiv").text;
				var dlen = dispListNodes[i].selectSingleNode("length").text;
				var propData = "";
				if ( itemNode )
				{
					propData =dataList[pname]; 
				}
				var readonly = "";
				var styledata = "margin: 0px;color: #000000;";
				if ( pdiv == "V" )
				{
					readonly = "readonly";
				}
				editHtml += "<th style='vertical-align:middle;background-color: #f9f9f9;'>"+name+"</th>";
				editHtml += "<td style='vertical-align:middle;margin: 0px;'>";
				var listNodes = dispListNodes[i].selectNodes("List");
				if ( listNodes && listNodes.length > 0)
				{
					editHtml += "<select name='"+pname+"' id='"+pname+"' "+lockedflag+" style='color: #000000;''>";
					editHtml += "<option value=\"\"></option>";
					for ( j = 0; j < listNodes.length; j++)
					{
						var list_lbl = listNodes[j].selectSingleNode("label").text;
						var list_val = listNodes[j].selectSingleNode("value").text;
						var selected = "";
						if ( list_val == propData)
						{
							selected = "selected";
						}
						editHtml += "<option value=\""+list_val+"\" "+selected+">"+list_lbl+"</option>";
					}
					editHtml += "</select>";
				}
				else
				{
					editHtml += "<input type='text' name='"+pname+"' id='"+pname+"' style='margin: 0px;' "+readonly+" value='"+propData+"' "+lockedflag+"/>";
				}
				editHtml += "</td>";
				editHtml += "</tr>";
			}
			if ( itemtype != "Part") {
				editHtml += "<input type='hidden' name='Current_RelationShipID' id='Current_RelationShipID' value='"+arasObj.getItemProperty(itemNode, "id") +"'/>";
			}
			editHtml += "</table>";
			return editHtml;
		}

		
		//-------------------
		// ���i�̏ڍ׏��擾����
		// �����F�m�[�h
		//-------------------
		function makeEditHtml(itemid, itemtype, dispListXML)
		{
			var lockedflag = "disabled='disabled'";
			var itemNode;
			// �A�C�e��ID���ݒ肳��Ă���ꍇ�́A�Ώ�PART�����擾����B
			if ( itemid != "" ) {
				itemNode = getItemById(itemtype , itemid);
				if ( itemNode ) {
					if ( itemtype == "Part" ) {
						if ( actionItemList[itemid] == "edit" ||  actionItemList[itemid] == "add") {
							lockedflag = "";
						}
					}
					else {
						if ( itemKeyValuList[itemid] ) {
							if ( actionItemList[itemKeyValuList[itemid]] == "edit" ||  actionItemList[itemKeyValuList[itemid]] == "add") {
								lockedflag = "";
							}
						}
					}
				} else {
					// �ΏۃA�C�e����Aras Innovator��ɑ��݂��Ȃ��ꍇ�͕ҏW�\�Ƃ���B
					lockedflag = "";
				}
			}
			var editHtml = "<table class='table table-bordered table-hover table-condensed'>";
			// Item�̃m�[�h�i���X�g�j�擾
			var dispListNodes = dispListXML.selectNodes("//Item");
			for ( i = 0; i < dispListNodes.length; i++ )
			{
				editHtml += "<tr>";
				var name = dispListNodes[i].selectSingleNode("name").text;
				var pname = dispListNodes[i].selectSingleNode("propertyname").text;
				var pdiv = dispListNodes[i].selectSingleNode("pdiv").text;
				var dlen = dispListNodes[i].selectSingleNode("length").text;
				var propData = "";
				if ( itemNode )
				{
					propData = arasObj.getItemProperty(itemNode, pname);
				}
				var readonly = "";
				var styledata = "margin: 0px;color: #000000;";
				if ( pdiv == "V" )
				{
					readonly = "readonly";
				}
				editHtml += "<th style='vertical-align:middle;background-color: #f9f9f9;'>"+name+"</th>";
				editHtml += "<td style='vertical-align:middle;margin: 0px;'>";
				var listNodes = dispListNodes[i].selectNodes("List");
				if ( listNodes && listNodes.length > 0)
				{
					editHtml += "<select name='"+pname+"' id='"+pname+"' "+lockedflag+" style='color: #000000;''>";
					editHtml += "<option value=\"\"></option>";
					for ( j = 0; j < listNodes.length; j++)
					{
						var list_lbl = listNodes[j].selectSingleNode("label").text;
						var list_val = listNodes[j].selectSingleNode("value").text;
						var selected = "";
						if ( list_val == propData)
						{
							selected = "selected";
						}
						editHtml += "<option value=\""+list_val+"\" "+selected+">"+list_lbl+"</option>";
					}
					editHtml += "</select>";
				}
				else
				{
					editHtml += "<input type='text' name='"+pname+"' id='"+pname+"' style='margin: 0px;' "+readonly+" value='"+propData+"' "+lockedflag+"/>";
				}
				editHtml += "</td>";
				editHtml += "</tr>";
			}
			if ( itemtype != "Part") {
				editHtml += "<input type='hidden' name='Current_RelationShipID' id='Current_RelationShipID' value='"+arasObj.getItemProperty(itemNode, "id") +"'/>";
			}
			editHtml += "</table>";
			return editHtml;
		}
		
		//-------------------
		// ���݂̐ݒ���(HTML)�̃v���p�e�B�E�ݒ�l��A�z�z��Ɋi�[���ĕԂ�
		//-------------------
		function getGridPropertyValueList() {
			var result = new Array();
			if ( dispList )
			{
				var dispListNodes = dispList.selectNodes("//Item");
				for ( i = 0; i < dispListNodes.length; i++ )
				{
					var pname = dispListNodes[i].selectSingleNode("propertyname").text;
					result[pname] = document.getElementById(pname).value ;
				}
			}
			return result;
		}
		
		//-------------------
		// ���݂�BOM�ݒ���(HTML)�̃v���p�e�B�E�ݒ�l��A�z�z��Ɋi�[���ĕԂ�
		//-------------------
		function getBOMGridPropertyValueList() {
			var result = new Array();
			if ( bomdispList )
			{
				rsResult = new Array();
				var bomdispListNodes = bomdispList.selectNodes("//Item");
				for ( i = 0; i < bomdispListNodes.length; i++ )
				{
					var pname = bomdispListNodes[i].selectSingleNode("propertyname").text;
					if ( document.getElementById(pname) )  {
						rsResult[pname] = document.getElementById(pname).value ;
					}
					else 	{
						rsResult[pname] = "";
					}
				}
				// �����[�V�����V�b�vID�̐ݒ�
				rsResult["Current_RelationShipID"] = document.getElementById("Current_RelationShipID").value ;
				return rsResult;
			}
			return result;
		}
		
		//-------------------
		// ���i�̏ڍ׏��擾����
		// �����F�m�[�h
		//-------------------
		function onClickTree(node) {
			// �c���[�̊e���i�I�����̏����̌Ăяo��
			selectTree(node.attr("id"), node.data("partbomId"));
		}
		
		//-------------------
		// �c���[�̊e���i�I�����̏���
		// �����F�\���p�L�[ID(RSID_PARTID)
		// �����F�����[�V�����V�b�v�A�C�e��ID
		//-------------------
		function selectTree(itemid, bomid)
		{
			var editDispHtml;
			var editBOMDispHtml;
			
			// �L�[ID�������[�V�����V�b�vID�A�A�C�e��ID�ɕ���
			var keyData = itemid.split("_");
			var relsItemId = keyData[0];		// �����[�V�����V�b�v�A�C�e��ID
			var partItemId = keyData[1];		// PARTS �A�C�e��ID
			itemKeyValuList[relsItemId] = partItemId;

			// ��O��PART ID��񂪐ݒ肳��Ă���ꍇ�́A�f�[�^��ޔ�����B
			if ( beforeSelectedItemId ) {
				//�N���b�N����O��PART�O���b�h����A�z�z��Ɋi�[
				gridPartDataList[beforeSelectedItemId] = document.getElementById("Part").innerHTML;
				//�N���b�N����O�̃f�[�^�O���b�h�̃v���p�e�B�E�ݒ�l��A�z�z��Ɋi�[
				gridPropertyValueList[beforeSelectedItemId] = getGridPropertyValueList();
			}
			// ��O��RELATIONSHIP ID��񂪐ݒ肳��Ă���ꍇ�́A�f�[�^��ޔ�����B
			if ( beforeSelectedResItemId )  {
				//�N���b�N����O��PART BOM�O���b�h����A�z�z��Ɋi�[
				gridPartBOMDataList[beforeSelectedResItemId] = document.getElementById("PartBOM").innerHTML;
				//�N���b�N����O�̃f�[�^�O���b�h�̃v���p�e�B�E�ݒ�l��A�z�z��Ɋi�[
				gridBOMPropertyValueList[beforeSelectedResItemId] = getBOMGridPropertyValueList();
			}

			// ���ɕҏW���ڂ����݂���ꍇ�́A���̒l��ݒ肷��B
			if ( gridPartDataList[partItemId] )
			{
				// editDispHtml = gridPartDataList[partItemId];
				editDispHtml = makeEditHtmlWithData(partItemId, "Part", dispList, gridPropertyValueList[partItemId], partItemId);
			}
			else
			{
				// �ҏW���ڂ̍ĕ\��
				if ( !dispList ) {
					// �\�����ڂ��擾�ł��Ȃ��ꍇ�́A�\�����ڂ��擾������ɁA�����f�[�^��ݒ肷��B
					editDispHtml = getDispList(partItemId);
				}
				else 	{
					editDispHtml = makeEditHtml(partItemId, "Part", dispList);
				}
			}
			// �\�����ڂ��ݒ肳��Ă���ꍇ�̂ݍĐݒ肷��B
			if ( editDispHtml )
			{
				document.getElementById("Part").innerHTML = editDispHtml;
				// test
				if ( gridPartDataList[partItemId] ) {
					var dataList = gridPropertyValueList[partItemId];
					if ( dataList ) {
						for ( var key in dataList) {
							document.getElementById(key).value = dataList[key];
						}
					}
				}
			}

			// ���ɕҏW���ڂ����݂���ꍇ�́A���̒l��ݒ肷��B
			if ( gridPartBOMDataList[relsItemId] )
			{
				// editDispHtml = gridPartBOMDataList[relsItemId];
				editDispHtml = makeEditHtmlWithData(bomid, "Part BOM", bomdispList, gridBOMPropertyValueList[relsItemId],  partItemId);
			}
			else
			{
				// �ҏW���ڂ̍ĕ\��
				if ( !dispList ) {
				// �\�����ڂ��擾�ł��Ȃ��ꍇ�́A�\�����ڂ��擾������ɁA�����f�[�^��ݒ肷��B
					editDispHtml = getRSDispList(bomid);
				}
				else {
					editDispHtml = makeEditHtml(bomid, "Part BOM", bomdispList);
				}
			}
			// �\�����ڂ��ݒ肳��Ă���ꍇ�̂ݍĐݒ肷��B
			if ( editDispHtml ) {
				document.getElementById("PartBOM").innerHTML = editDispHtml;
				// test
				if ( gridPartBOMDataList[relsItemId] ) {
					var dataList = gridBOMPropertyValueList[relsItemId];
					if ( dataList ) {
						for ( var key in dataList) {
							document.getElementById(key).value = dataList[key];
						}
					}
				}
			}
			// �O��I���A�C�e��ID�����ݑI�����Ă���A�C�e��ID�ɕύX
			beforeSelectedItemId = partItemId;
			beforeSelectedResItemId = relsItemId;
		}

		//-------------------
		// �A�C�e���̍\���v�f�擾
		//-------------------
		function getItemStructure()
		{
			// ���N�G�X�g���쐬
			var methodAML =
				"<Item " +
				" type='" + window.dialogArguments.parent.getType() + "' " +
				" id='" + window.dialogArguments.parent.getID() + "' " +
				" mode='init' " +
				" action='GetItemTreeStructure' " +
				" levels='-1' />";
			
			//Aras�̃c���[�f�[�^�擾�����Ăяo��
			var res = arasObj.applyMethod("GetItemTreeGridStructure", methodAML);

			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Json�̃f�[�^�𔲂��o��
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				return xDoc.selectSingleNode("Result/Json").text;
			}
			return returnObj;
		}

		// �f�[�^�擾
		function getData()
		{
			var data = jQuery.jstree._reference("#tt").get_json(-1);
			var mytext = JSON.stringify(data);
		}

		//-------------------
		// �A�C�e�����擾
		// ����1�Ftype
		// ����2�Fid
		//-------------------
		function getItemById(type, id)
		{
			var lockedFlag = "0";
			// ���N�G�X�g���쐬
			var methodAML =
				"<Item " +
				" type='" + type + "' " +
				" id='" + id + "' " +
				" action='GetItemTreeGridItemLocked' " +
				"/>";
			
			//Aras�̃c���[�f�[�^�擾�����Ăяo��
			var res = arasObj.applyMethod("GetItemTreeGridItemLocked", methodAML);
			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Json�̃f�[�^�𔲂��o��
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				lockedFlag = xDoc.selectSingleNode("Result").text;
			}
			var itemNd = arasObj.getItemById(type, id);
			if(itemNd)
			{
				itemNd.setAttribute("lockedFlag", lockedFlag);
				return itemNd;
			}
		}

		//-------------------
		// Part BOM�̐��ʎ擾
		// ����1�F�eid
		// ����2�Fid
		// ����3�F�擾�Ώۃt�B�[���h
		//-------------------
		function gerQuantityFromPartBOM(parentId, id, field)
		{
			//���N�G�X�g�쐬
			var aml = "<Item action='get' type='Part BOM'>" +
				"<RELATED_ID condition='eq'>" + id + "</RELATED_ID>" +
				 "<SOURCE_ID condition='eq'>" + parentId + "</SOURCE_ID>" +
				 "</Item>";
			//Aras�̃A�C�e���擾�����Ăяo��
			var res = arasObj.applyItem(aml);
			var selectNodeElement = "Item/" + field;
			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Ώۃf�[�^�𔲂��o��
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				if(null != xDoc.selectSingleNode(selectNodeElement)){
					return xDoc.selectSingleNode(selectNodeElement).text;
				}
			}
			return null;
		}

		//-------------------
		// �S�ĕ��鏈��
		//-------------------
		function collapseAll(){
		    $("#tt").jstree("close_all");
		}
		//-------------------
		//�S�ĊJ������
		//-------------------
		function expandAll(){
		    $("#tt").jstree("open_all");
		}

		//--------------------
		// �V�K�쐬
		//--------------------
		function createItem()
		{
			// $("#json_string").val(editItem);
			// alert( jQuery.jstree._focused().get_selected().data("id") );
			// alert("Create Item...");
			// $.jstree._focused()
			// $("#tt").jstree("create");
		}
		
		//-------------------
		// �I���s�폜
		//-------------------
		function removeItem()
		{  
			// alert("Remove Item...");
			// �Ώۂ̍폜
			// $("#tt").jstree("remove");
		}  
		
		//-------------------
		// �폜����
		//-------------------
		function onclickRemovePart(tree, item)
		{
			// �g�b�v���ڂ͍폜���Ȃ�
			var keyData = item.attr("id").split("_");
			var relsItemId = keyData[0];		// �����[�V�����V�b�v�A�C�e��ID
			if ( relsItemId == "" ) {
				return;
			}
			
			// �o�^�f�[�^�ɑ��݂���ꍇ
			if ( addRSItemList[item.data("id")] ) {
				// �폜���܂�
				delete addRSItemList[item.data("id")]; 
			}
				// �ړ��f�[�^�ɑ��݂���ꍇ
			else if ( moveRSItemList[item.data("id")] ) {
				// �ړ��v�f���폜���܂�
				delete addRSItemList[item.data("id")]; 
				// �폜�v�f�Ƃ��Ēǉ����܂��B
				deleteRSItemList[item.data("id") ]=item.data("partbomId");
			}
			else {
				deleteRSItemList[item.data("id") ]=item.data("partbomId");
			}
			tree.remove(item); 
		}

		//-------------------
		// �ۑ�����
		//-------------------
		function onclickSaveParts()
		{
			var editItem = "";
			//�N���b�N����O�̃O���b�h����A�z�z��Ɋi�[
			gridPartDataList[beforeSelectedItemId] = document.getElementById("Part").innerHTML;
			gridPartBOMDataList[beforeSelectedResItemId] = document.getElementById("PartBOM").innerHTML;
			//�N���b�N����O�̃f�[�^�O���b�h�̃v���p�e�B�E�ݒ�l��A�z�z��Ɋi�[
			gridPropertyValueList[beforeSelectedItemId] = getGridPropertyValueList();
			gridBOMPropertyValueList[beforeSelectedResItemId] = getBOMGridPropertyValueList();

			// �A�N�V������񂩂画��
			for ( var key in actionItemList) {
				var action = actionItemList[key];
				// �A�N�V������񂪑��݂��A"add", "edit"�̏ꍇ�͏����Ώ�
				if ( action == "add" || action == "edit"  ) {
					// �ҏW�p�f�[�^�ɑ��݂���ꍇ
					var propValueList = gridPropertyValueList[key];
					editItem += "<Item type='Part' id='"+key+"' action='"+action+"'>";
					if ( propValueList ) {
						for ( var name in propValueList )
						{
							editItem += "<" +name+ ">"+propValueList[name]+"</" +name+ ">";
						}
					}
					editItem += "</Item>";
					// �����[�V�����V�b�v�o�^�E�폜�ɑΏۃL�[�����݂��Ȃ��ꍇ�͏������Ȃ�
					for ( var rsKey in itemKeyValuList ) {
						var partId = itemKeyValuList[rsKey];
						if ( partId == key ) {
							var bomList = gridBOMPropertyValueList[rsKey];
							if ( bomList ) {
								if ( bomList["Current_RelationShipID"] != "undefined") {
									editItem += "<Item type='Part BOM' action='edit' id='"+bomList["Current_RelationShipID"]+"'>";
									for ( var editCt in bomList) {
										if ( editCt != "Current_RelationShipID" ) {
											var dataList = bomList[editCt];
											editItem += "<" +editCt+ ">" + bomList[editCt] + "</" +editCt+ ">";
										}
									}
									editItem += "</Item>";
								}
							}
						}
					}
				}
			}
			
			//�ǉ������[�V�����V�b�v�p �f�[�^�A�z�z��
			for ( var key in addRSItemList) {
				var dataList = addRSItemList[key];
				editItem += "<Item type='Part BOM' action='add' id='"+dataList["relsId"]+"'>";
				editItem += "<source_id><Item type='Part' action='get'><config_id>"+dataList["parentId"]+"</config_id><is_current>1</is_current></Item></source_id>";
				editItem += "<related_id>"+key+"</related_id>";
				// �ҏW���ڃf�[�^���X�g����f�[�^�̎擾
				var dataList = gridBOMPropertyValueList[key];
				// �f�[�^�����݂���ꍇ�́A�����[�V�����V�b�v�f�[�^�ɐݒ�
				if ( dataList ) {
					for (var name in dataList) {
						editItem += "<"+name+">"+dataList[name]+"</"+name+">";
					}
				}
				delete gridBOMPropertyValueList[key];
				editItem += "</Item>";
			}
			//�����[�V�����V�b�v�폜�p �f�[�^�A�z�z��
			for ( var key in deleteRSItemList) {
				var data = deleteRSItemList[key];
				editItem += "<Item type='Part BOM' action='delete' id='"+data+"'>";
				editItem += "</Item>";
			}
			//�����[�V�����V�b�v�ړ��p �f�[�^�A�z�z��
			for ( var key in moveRSItemList) {
				var dataList = moveRSItemList[key];
				// �폜
				editItem += "<Item type='Part BOM' action='delete' id='"+dataList["relsId"]+"'>";
				editItem += "</Item>";
				// �ǉ�
				editItem += "<Item type='Part BOM' action='add' id='"+dataList["relsId"]+"'>";
				editItem += "<source_id><Item type='Part' action='get'><config_id>"+dataList["parentId"]+"</config_id><is_current>1</is_current></Item></source_id>";
				editItem += "<related_id>"+key+"</related_id>";
				// �ҏW���ڃf�[�^���X�g����f�[�^�̎擾
				var dataList = gridBOMPropertyValueList[key];
				// �f�[�^�����݂���ꍇ�́A�����[�V�����V�b�v�f�[�^�ɐݒ�
				if ( dataList ) {
					for (var name in dataList) {
						editItem += "<"+name+">"+dataList[name]+"</"+name+">";
					}
				}
				delete gridBOMPropertyValueList[key];
				editItem += "</Item>";
			}
			// ���N�G�X�g���쐬
			var methodAML = "<ItemData>" + editItem +"</ItemData>";
			//Aras�̃c���[�f�[�^�擾�����Ăяo��
			var res = arasObj.applyMethod("MakeItemTreeGridStructure", methodAML);
			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Json�̃f�[�^�𔲂��o��
			var message = "Failure SAVE!";
			if(res) {
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				message = xDoc.selectSingleNode("Result").text;
				if ( message == "SUCCESS") {
					message = SUCCESS_MESSAGE;
				}
			}
			alert ( message );
			// ���펞�̂݃��t���b�V��
			if (message == SUCCESS_MESSAGE) {
				// �A�z�z��̏�����
				gridPartDataList = new Array();
				gridPartBOMDataList = new Array();
				//�f�[�^�O���b�h�̊e�v���p�e�B�E�f�[�^�p�A�z�z��
				gridPropertyValueList = new Array();
				//BOM�f�[�^�O���b�h�̊e�v���p�e�B�E�f�[�^�p�A�z�z��
				gridBOMPropertyValueList = new Array();
				//�ǉ������[�V�����V�b�v�p �f�[�^�A�z�z��
				addRSItemList = new Array();
				//�ړ������[�V�����V�b�v�p �f�[�^�A�z�z��
				moveRSItemList = new Array();
				//�폜�����[�V�����V�b�v�p �f�[�^�A�z�z��
				deleteRSItemList = new Array();
				//PARTS�����A�z�z��i�ǉ��A�ҏW�j
				actionItemList = new Array();
				// �O��I�����ڃA�C�e��ID
				beforeSelectedItemId = undefined;
				// �O��I�����ڃ����[������V�b�v�A�C�e��ID
				beforeSelectedResItemId = undefined;
				// �ĕ\��
				refreshWindow();
			}
		}

		//-------------------
		// ���b�N���̏���
		// �����F�ΏۃA�C�e�����
		//-------------------
		function onclickLockItem(node)
		{
			// ���b�N����Ă��Ȃ��ꍇ�̂ݑΏ�
			if ( node.data("lock") != "0" ) {
				alert("Already Locked!");
				return false;
			}
			var lockItemNode = arasObj.getItemById("Part", node.data("id"));
			if ( lockItemNode ) {
				var result = arasObj.lockItemEx(lockItemNode);
				if ( result ) {
					node.data({"lock":"1"});
					node.attr({"rel" : "edit"});
				} else {
					alert("Error :: Lock");
					return false;
				}
			} else {
				alert("Error :: Get Item");
				return false;
			}
			return true;
		}

		//-------------------
		// �A�����b�N���̏���
		// �����F�ΏۃA�C�e�����
		//-------------------
		function onclickUnlockItem(node)
		{
			// �����[�U�����b�N���Ă���ꍇ�̂ݑΏ�
			if ( node.data("lock") == "" || node.data("lock") =="0" )
			{
				alert("Not Locked!");
				return false;
			}
			else if ( node.data("lock") == "2" )
			{
				alert("Other User Locked!");
				return false;
			}
			// �uOK�v���̏����J�n �{ �m�F�_�C�A���O�̕\��
			if(window.confirm('Unlocking Part?')){
				var unlockItemNode = arasObj.getItemById("Part", node.data("id"));
				if ( unlockItemNode ) {
					var result = arasObj.unlockItemEx(unlockItemNode);
					if ( result ) {
						node.data({"lock":"0"});
						node.attr({"rel" : "part"});
					} else {
						alert("Error :: UnLock");
						return false;
					}
				}
				else
				{
					alert("Error :: Get Item");
					return false;
				}
			}
			return true;
		}

		//-------------------
		// �����A�C�e���ǉ��{�^���N���b�N����
		// �����F�A�C�e���^�C�v���
		//-------------------
		function onclickExistPartsAdd(node, item)
		{
			if ( item )
			{
				var res = undefined;
				//�A���X�̈ꗗ��ʂ�\������
				res = top.showModalDialog(arasObj.getScriptsURL() + 'searchDialog.html', 
										{ aras:arasObj, itemtypeName:TYPE_PART, sourceItemTypeName:TYPE_PART, sourcePropertyName:TYPE_PART},
										'dialogHeight: 450px; dialogWidth: 700px; status:0; help:0; resizable:1;scroll:0;');
				//�I���f�[�^�����݂���ꍇ�́A�擾�����A�C�e��ID�ƑI�����Ă���A�C�e��ID�����ɒǉ�����B
				if ( res )
				{
					var treeData = getItemStructureWithId(res.itemID);
					var treeObj = (new Function("return " + treeData))();
					// �q�܂Œǉ�
					$("#tt").jstree("create", item,"last",treeObj,false,true);
					if ( treeObj.children ) {
						addChildTreeData(treeObj, 0);
					}
					var relshipList = new Array();
					// �V�K�����[�V�����V�b�vID
					relshipList["relsId"] = $("#" + treeObj.attr.id).data("partbomId");
					// �e�A�C�e����config_id
					relshipList["parentId"] = item.data("configId");
					addRSItemList[res.itemID] = relshipList;
					actionItemList[res.itemID] = item.data("action");
				}
			}
		}
		
		function addChildTreeData(childTreeObj, point)
		{
			if ( childTreeObj.children )
			{
				var maxlen = childTreeObj.children.length;
				// �q���i�����݂���ꍇ
				for ( var cnt = 0; cnt < maxlen; cnt++)
				{
					var childObj = childTreeObj.children[cnt];
					$("#tt").jstree("create", $("#" + childTreeObj.attr.id),"last",childObj,false,true);
					if ( childObj.children )
					{
						addChildTreeData(childObj, ++point);
					}
				}
			}
			return;
		}

		//-------------------
		// �V�K�A�C�e���ǉ��{�^���N���b�N����
		// �����F�A�C�e���^�C�v���
		//-------------------
		function onclickNewPartsAddBtn(node, item)
		{
			// �V�K�A�C�e��ID�ƃ����[�V�����V�b�vID���擾
			var newID = arasObj.generateNewGUID();
			var newRSID = arasObj.generateNewGUID();
			// �c���[�o�^�p�f�[�^�̍쐬
			var newPart = "{\"data\":{\"title\":\""+newID+"\"},";
				newPart += "\"attr\":{\"id\":\""+newRSID +"_" + newID + "_" +"\",\"rel\":\"edit\"},";
				newPart += "\"metadata\":{";
				newPart += "\"id\":\""+newID+"\",";
				newPart += "\"type\":\""+TYPE_PART+"\",";
				newPart += "\"lock\":\"1\",";
				newPart += "\"parentId\":\""+item.data("configId")+"\",";
				newPart += "\"partbomId\":\""+newRSID+"\",";
				newPart += "\"configId\":\""+newID+"\",";
				newPart += "\"action\":\"edit\",";
				newPart += "\"quantity\":\"0\",";
				newPart += "\"disptitle\":\""+newID+"\",";
				newPart += "\"sort_order\":\"\"}}";
			var newPartObj = (new Function("return " + newPart))();
			node.create(item, "last",  newPartObj ,  false, true);
			var relshipList = new Array();
			// �V�K�����[�V�����V�b�vID
			relshipList["relsId"] = newRSID;
			// �e�A�C�e����config_id
			relshipList["parentId"] = item.data("configId");
			addRSItemList[newID] = relshipList;
			actionItemList[newID] = "add";
		}

		//-------------------
		// �A�C�e���̍\���v�f�擾
		//-------------------
		function getItemStructureWithId(id)
		{
			// ���N�G�X�g���쐬
			var methodAML =
				"<Item " +
				" type='" + window.dialogArguments.parent.getType() + "' " +
				" id='" + id + "' " +
				" mode='add' " +
				" action='GetItemTreeStructure' " +
				" levels='-1' />";
			
			//Aras�̃c���[�f�[�^�擾�����Ăяo��
			var res = arasObj.applyMethod("GetItemTreeGridStructure", methodAML);

			//�f�[�^���擾�ł����ꍇ�AXML�f�[�^����Json�̃f�[�^�𔲂��o��
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				return xDoc.selectSingleNode("Result/Json").text;
			}
		}
