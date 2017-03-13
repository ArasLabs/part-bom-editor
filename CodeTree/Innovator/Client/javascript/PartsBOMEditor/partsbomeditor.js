	//-------------------------------------------------------------------------------------
	// PartsBOMEditor.html
	// 
	// 概要：	選択された部品の構成情報をツリーで表示し、各データの編集を行えます。
	//			また追加、削除、ドラック＆ドロップを行うことができます。
	//-------------------------------------------------------------------------------------
		
		//-------------------
		// 定数
		//-------------------
		//部品アイテムタイプ名
		var TYPE_PART = "Part";
		//ロックＯＮアイコンクラス名
		var LOCK_ON = "on";
		//ロックＯＦＦアイコンクラス名
		var LOCK_OFF = "off";
		//新規フラグ
		var ADD_ON = "add";
		//編集フラグ
		var EDIT_ON = "edit";
		//未編集フラグ
		var GET_ON = "get";
		//保存時のメッセージ
		var SUCCESS_MESSAGE = "Parts saved successfully.";

		//-------------------
		// グローバル変数
		//-------------------
		//Arasオブジェクト設定
		var arasObj = window.dialogArguments.aras;
		//データグリッド HTML連想配列
		var gridPartDataList = new Array();
		var gridPartBOMDataList = new Array();
		//データグリッドの各プロパティ・データ用連想配列
		var gridPropertyValueList = new Array();
		//BOMデータグリッドの各プロパティ・データ用連想配列
		var gridBOMPropertyValueList = new Array();
		//リレーションシップIDをキーに、アイテムＩＤを設定
		var itemKeyValuList = new Array();
		//追加リレーションシップ用 データ連想配列
		var addRSItemList = new Array();
		//移動リレーションシップ用 データ連想配列
		var moveRSItemList = new Array();
		//削除リレーションシップ用 データ連想配列
		var deleteRSItemList = new Array();
		//PARTS処理連想配列（追加、編集）
		var actionItemList = new Array();
		//前回選択項目アイテムID
		var beforeSelectedItemId;
		//前回選択項目アイテムID(リレーションシップアイテム)
		var beforeSelectedResItemId;
		//初期表示フラグ
		var initFlg =0;
		//初期表示フラグ
		var lockFlg =0;
		//lock時選択アイテムＩＤ
		var lockItemId;
		//表示項目リスト
		var dispList;
		//BOM表示項目リスト
		var bomdispList;
		//
		var lockMode;

		//-------------------
		// 画面ロード時のツリーデータ取得処理
		// イベント：onload
		//-------------------
		window.onload=function() {
			refreshWindow();
		}

		//-------------------
		// 画面ロード時のツリーデータ取得処理
		// イベント：onload
		//-------------------
		function refreshWindow() {
			// ツリーの構成要素取得
			var treeData = getItemStructure();
			var treeObj = (new Function("return " + treeData))();
			//jsTreeを使った表示
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
							// 移動したアイテムに対する、親アイテムのconfig_idを連想配列に格納
							// 削除用
							var relshipList = new Array();
							relshipList["relsId"] = data.rslt.o.data("partbomId");
							relshipList["parentId"] = data.rslt.np.data("configId");
							moveRSItemList[data.rslt.o.data("id")] = relshipList;
						}
			);
			// 入力項目、プロパティ項目
			document.getElementById("Part").innerHTML = getDispList(""); // getDispList(window.dialogArguments.parent.getID());
			document.getElementById("PartBOM").innerHTML = getRSDispList("");
			// selectTree(window.dialogArguments.parent.getID(), "");
			selectTree("_" + window.dialogArguments.parent.getID(), "");
			$("#tab a:first").tab("show");
			// 画面表示状態の編集状態を格納
			actionItemList[treeObj.metadata.id] = treeObj.metadata.action;
			if ( treeObj.children) {
				firstChildTreeData(treeObj);
			}
		}

		function firstChildTreeData(childTreeObj)
		{
			var maxlen = childTreeObj.children.length;
			// 子部品が存在する場合
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
		// 編集モードの切り替え
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
		// 表示項目の取得
		//-------------------
		function getDispList(itemid)
		{
			// リクエスト情報作成
			var methodAML = "<Item type='" + window.dialogArguments.parent.getType() + "' action='GetItemTreeGridStructureLabel' />";
			//Arasのツリーデータ取得処理呼び出し
			var res = arasObj.applyMethod("GetItemTreeGridStructureLabel", methodAML);
			//データが取得できた場合、XMLデータからItem(XML)のデータを抜き出す
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				dispList = xDoc.selectSingleNode("Result");
			}
			return makeEditHtml(itemid, "Part", dispList);
		}
		
		//-------------------
		// 表示項目の取得
		//-------------------
		function getRSDispList(relationshipid)
		{
			var htmlData = "";
			// BOMリクエスト情報作成
			var methodAML = "<Item type='PART BOM' action='GetItemTreeGridStructureLabel' />";
			//Arasのツリーデータ取得処理呼び出し
			var res = arasObj.applyMethod("GetItemTreeGridStructureLabel", methodAML);
			//データが取得できた場合、XMLデータからItem(XML)のデータを抜き出す
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
			// アイテムIDが設定されている場合は、対象PART情報を取得する。
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
			// Itemのノード（リスト）取得
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
		// 部品の詳細情報取得処理
		// 引数：ノード
		//-------------------
		function makeEditHtml(itemid, itemtype, dispListXML)
		{
			var lockedflag = "disabled='disabled'";
			var itemNode;
			// アイテムIDが設定されている場合は、対象PART情報を取得する。
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
					// 対象アイテムがAras Innovator上に存在しない場合は編集可能とする。
					lockedflag = "";
				}
			}
			var editHtml = "<table class='table table-bordered table-hover table-condensed'>";
			// Itemのノード（リスト）取得
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
		// 現在の設定情報(HTML)のプロパティ・設定値を連想配列に格納して返す
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
		// 現在のBOM設定情報(HTML)のプロパティ・設定値を連想配列に格納して返す
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
				// リレーションシップIDの設定
				rsResult["Current_RelationShipID"] = document.getElementById("Current_RelationShipID").value ;
				return rsResult;
			}
			return result;
		}
		
		//-------------------
		// 部品の詳細情報取得処理
		// 引数：ノード
		//-------------------
		function onClickTree(node) {
			// ツリーの各部品選択時の処理の呼び出し
			selectTree(node.attr("id"), node.data("partbomId"));
		}
		
		//-------------------
		// ツリーの各部品選択時の処理
		// 引数：表示用キーID(RSID_PARTID)
		// 引数：リレーションシップアイテムID
		//-------------------
		function selectTree(itemid, bomid)
		{
			var editDispHtml;
			var editBOMDispHtml;
			
			// キーIDをリレーションシップID、アイテムIDに分解
			var keyData = itemid.split("_");
			var relsItemId = keyData[0];		// リレーションシップアイテムID
			var partItemId = keyData[1];		// PARTS アイテムID
			itemKeyValuList[relsItemId] = partItemId;

			// 一つ前のPART ID情報が設定されている場合は、データを退避する。
			if ( beforeSelectedItemId ) {
				//クリックする前のPARTグリッド情報を連想配列に格納
				gridPartDataList[beforeSelectedItemId] = document.getElementById("Part").innerHTML;
				//クリックする前のデータグリッドのプロパティ・設定値を連想配列に格納
				gridPropertyValueList[beforeSelectedItemId] = getGridPropertyValueList();
			}
			// 一つ前のRELATIONSHIP ID情報が設定されている場合は、データを退避する。
			if ( beforeSelectedResItemId )  {
				//クリックする前のPART BOMグリッド情報を連想配列に格納
				gridPartBOMDataList[beforeSelectedResItemId] = document.getElementById("PartBOM").innerHTML;
				//クリックする前のデータグリッドのプロパティ・設定値を連想配列に格納
				gridBOMPropertyValueList[beforeSelectedResItemId] = getBOMGridPropertyValueList();
			}

			// 既に編集項目が存在する場合は、その値を設定する。
			if ( gridPartDataList[partItemId] )
			{
				// editDispHtml = gridPartDataList[partItemId];
				editDispHtml = makeEditHtmlWithData(partItemId, "Part", dispList, gridPropertyValueList[partItemId], partItemId);
			}
			else
			{
				// 編集項目の再表示
				if ( !dispList ) {
					// 表示項目が取得できない場合は、表示項目を取得した後に、既存データを設定する。
					editDispHtml = getDispList(partItemId);
				}
				else 	{
					editDispHtml = makeEditHtml(partItemId, "Part", dispList);
				}
			}
			// 表示項目が設定されている場合のみ再設定する。
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

			// 既に編集項目が存在する場合は、その値を設定する。
			if ( gridPartBOMDataList[relsItemId] )
			{
				// editDispHtml = gridPartBOMDataList[relsItemId];
				editDispHtml = makeEditHtmlWithData(bomid, "Part BOM", bomdispList, gridBOMPropertyValueList[relsItemId],  partItemId);
			}
			else
			{
				// 編集項目の再表示
				if ( !dispList ) {
				// 表示項目が取得できない場合は、表示項目を取得した後に、既存データを設定する。
					editDispHtml = getRSDispList(bomid);
				}
				else {
					editDispHtml = makeEditHtml(bomid, "Part BOM", bomdispList);
				}
			}
			// 表示項目が設定されている場合のみ再設定する。
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
			// 前回選択アイテムIDを現在選択しているアイテムIDに変更
			beforeSelectedItemId = partItemId;
			beforeSelectedResItemId = relsItemId;
		}

		//-------------------
		// アイテムの構成要素取得
		//-------------------
		function getItemStructure()
		{
			// リクエスト情報作成
			var methodAML =
				"<Item " +
				" type='" + window.dialogArguments.parent.getType() + "' " +
				" id='" + window.dialogArguments.parent.getID() + "' " +
				" mode='init' " +
				" action='GetItemTreeStructure' " +
				" levels='-1' />";
			
			//Arasのツリーデータ取得処理呼び出し
			var res = arasObj.applyMethod("GetItemTreeGridStructure", methodAML);

			//データが取得できた場合、XMLデータからJsonのデータを抜き出す
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				return xDoc.selectSingleNode("Result/Json").text;
			}
			return returnObj;
		}

		// データ取得
		function getData()
		{
			var data = jQuery.jstree._reference("#tt").get_json(-1);
			var mytext = JSON.stringify(data);
		}

		//-------------------
		// アイテム情報取得
		// 引数1：type
		// 引数2：id
		//-------------------
		function getItemById(type, id)
		{
			var lockedFlag = "0";
			// リクエスト情報作成
			var methodAML =
				"<Item " +
				" type='" + type + "' " +
				" id='" + id + "' " +
				" action='GetItemTreeGridItemLocked' " +
				"/>";
			
			//Arasのツリーデータ取得処理呼び出し
			var res = arasObj.applyMethod("GetItemTreeGridItemLocked", methodAML);
			//データが取得できた場合、XMLデータからJsonのデータを抜き出す
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
		// Part BOMの数量取得
		// 引数1：親id
		// 引数2：id
		// 引数3：取得対象フィールド
		//-------------------
		function gerQuantityFromPartBOM(parentId, id, field)
		{
			//リクエスト作成
			var aml = "<Item action='get' type='Part BOM'>" +
				"<RELATED_ID condition='eq'>" + id + "</RELATED_ID>" +
				 "<SOURCE_ID condition='eq'>" + parentId + "</SOURCE_ID>" +
				 "</Item>";
			//Arasのアイテム取得処理呼び出し
			var res = arasObj.applyItem(aml);
			var selectNodeElement = "Item/" + field;
			//データが取得できた場合、XMLデータから対象データを抜き出す
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
		// 全て閉じる処理
		//-------------------
		function collapseAll(){
		    $("#tt").jstree("close_all");
		}
		//-------------------
		//全て開く処理
		//-------------------
		function expandAll(){
		    $("#tt").jstree("open_all");
		}

		//--------------------
		// 新規作成
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
		// 選択行削除
		//-------------------
		function removeItem()
		{  
			// alert("Remove Item...");
			// 対象の削除
			// $("#tt").jstree("remove");
		}  
		
		//-------------------
		// 削除処理
		//-------------------
		function onclickRemovePart(tree, item)
		{
			// トップ項目は削除しない
			var keyData = item.attr("id").split("_");
			var relsItemId = keyData[0];		// リレーションシップアイテムID
			if ( relsItemId == "" ) {
				return;
			}
			
			// 登録データに存在する場合
			if ( addRSItemList[item.data("id")] ) {
				// 削除します
				delete addRSItemList[item.data("id")]; 
			}
				// 移動データに存在する場合
			else if ( moveRSItemList[item.data("id")] ) {
				// 移動要素を削除します
				delete addRSItemList[item.data("id")]; 
				// 削除要素として追加します。
				deleteRSItemList[item.data("id") ]=item.data("partbomId");
			}
			else {
				deleteRSItemList[item.data("id") ]=item.data("partbomId");
			}
			tree.remove(item); 
		}

		//-------------------
		// 保存処理
		//-------------------
		function onclickSaveParts()
		{
			var editItem = "";
			//クリックする前のグリッド情報を連想配列に格納
			gridPartDataList[beforeSelectedItemId] = document.getElementById("Part").innerHTML;
			gridPartBOMDataList[beforeSelectedResItemId] = document.getElementById("PartBOM").innerHTML;
			//クリックする前のデータグリッドのプロパティ・設定値を連想配列に格納
			gridPropertyValueList[beforeSelectedItemId] = getGridPropertyValueList();
			gridBOMPropertyValueList[beforeSelectedResItemId] = getBOMGridPropertyValueList();

			// アクション情報から判定
			for ( var key in actionItemList) {
				var action = actionItemList[key];
				// アクション情報が存在し、"add", "edit"の場合は処理対象
				if ( action == "add" || action == "edit"  ) {
					// 編集用データに存在する場合
					var propValueList = gridPropertyValueList[key];
					editItem += "<Item type='Part' id='"+key+"' action='"+action+"'>";
					if ( propValueList ) {
						for ( var name in propValueList )
						{
							editItem += "<" +name+ ">"+propValueList[name]+"</" +name+ ">";
						}
					}
					editItem += "</Item>";
					// リレーションシップ登録・削除に対象キーが存在しない場合は処理しない
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
			
			//追加リレーションシップ用 データ連想配列
			for ( var key in addRSItemList) {
				var dataList = addRSItemList[key];
				editItem += "<Item type='Part BOM' action='add' id='"+dataList["relsId"]+"'>";
				editItem += "<source_id><Item type='Part' action='get'><config_id>"+dataList["parentId"]+"</config_id><is_current>1</is_current></Item></source_id>";
				editItem += "<related_id>"+key+"</related_id>";
				// 編集項目データリストからデータの取得
				var dataList = gridBOMPropertyValueList[key];
				// データが存在する場合は、リレーションシップデータに設定
				if ( dataList ) {
					for (var name in dataList) {
						editItem += "<"+name+">"+dataList[name]+"</"+name+">";
					}
				}
				delete gridBOMPropertyValueList[key];
				editItem += "</Item>";
			}
			//リレーションシップ削除用 データ連想配列
			for ( var key in deleteRSItemList) {
				var data = deleteRSItemList[key];
				editItem += "<Item type='Part BOM' action='delete' id='"+data+"'>";
				editItem += "</Item>";
			}
			//リレーションシップ移動用 データ連想配列
			for ( var key in moveRSItemList) {
				var dataList = moveRSItemList[key];
				// 削除
				editItem += "<Item type='Part BOM' action='delete' id='"+dataList["relsId"]+"'>";
				editItem += "</Item>";
				// 追加
				editItem += "<Item type='Part BOM' action='add' id='"+dataList["relsId"]+"'>";
				editItem += "<source_id><Item type='Part' action='get'><config_id>"+dataList["parentId"]+"</config_id><is_current>1</is_current></Item></source_id>";
				editItem += "<related_id>"+key+"</related_id>";
				// 編集項目データリストからデータの取得
				var dataList = gridBOMPropertyValueList[key];
				// データが存在する場合は、リレーションシップデータに設定
				if ( dataList ) {
					for (var name in dataList) {
						editItem += "<"+name+">"+dataList[name]+"</"+name+">";
					}
				}
				delete gridBOMPropertyValueList[key];
				editItem += "</Item>";
			}
			// リクエスト情報作成
			var methodAML = "<ItemData>" + editItem +"</ItemData>";
			//Arasのツリーデータ取得処理呼び出し
			var res = arasObj.applyMethod("MakeItemTreeGridStructure", methodAML);
			//データが取得できた場合、XMLデータからJsonのデータを抜き出す
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
			// 正常時のみリフレッシュ
			if (message == SUCCESS_MESSAGE) {
				// 連想配列の初期化
				gridPartDataList = new Array();
				gridPartBOMDataList = new Array();
				//データグリッドの各プロパティ・データ用連想配列
				gridPropertyValueList = new Array();
				//BOMデータグリッドの各プロパティ・データ用連想配列
				gridBOMPropertyValueList = new Array();
				//追加リレーションシップ用 データ連想配列
				addRSItemList = new Array();
				//移動リレーションシップ用 データ連想配列
				moveRSItemList = new Array();
				//削除リレーションシップ用 データ連想配列
				deleteRSItemList = new Array();
				//PARTS処理連想配列（追加、編集）
				actionItemList = new Array();
				// 前回選択項目アイテムID
				beforeSelectedItemId = undefined;
				// 前回選択項目リレー諸所んシップアイテムID
				beforeSelectedResItemId = undefined;
				// 再表示
				refreshWindow();
			}
		}

		//-------------------
		// ロック時の処理
		// 引数：対象アイテム情報
		//-------------------
		function onclickLockItem(node)
		{
			// ロックされていない場合のみ対象
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
		// アンロック時の処理
		// 引数：対象アイテム情報
		//-------------------
		function onclickUnlockItem(node)
		{
			// 自ユーザがロックしている場合のみ対象
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
			// 「OK」時の処理開始 ＋ 確認ダイアログの表示
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
		// 既存アイテム追加ボタンクリック処理
		// 引数：アイテムタイプ情報
		//-------------------
		function onclickExistPartsAdd(node, item)
		{
			if ( item )
			{
				var res = undefined;
				//アラスの一覧画面を表示する
				res = top.showModalDialog(arasObj.getScriptsURL() + 'searchDialog.html', 
										{ aras:arasObj, itemtypeName:TYPE_PART, sourceItemTypeName:TYPE_PART, sourcePropertyName:TYPE_PART},
										'dialogHeight: 450px; dialogWidth: 700px; status:0; help:0; resizable:1;scroll:0;');
				//選択データが存在する場合は、取得したアイテムIDと選択しているアイテムIDを元に追加する。
				if ( res )
				{
					var treeData = getItemStructureWithId(res.itemID);
					var treeObj = (new Function("return " + treeData))();
					// 子まで追加
					$("#tt").jstree("create", item,"last",treeObj,false,true);
					if ( treeObj.children ) {
						addChildTreeData(treeObj, 0);
					}
					var relshipList = new Array();
					// 新規リレーションシップID
					relshipList["relsId"] = $("#" + treeObj.attr.id).data("partbomId");
					// 親アイテムのconfig_id
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
				// 子部品が存在する場合
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
		// 新規アイテム追加ボタンクリック処理
		// 引数：アイテムタイプ情報
		//-------------------
		function onclickNewPartsAddBtn(node, item)
		{
			// 新規アイテムIDとリレーションシップIDを取得
			var newID = arasObj.generateNewGUID();
			var newRSID = arasObj.generateNewGUID();
			// ツリー登録用データの作成
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
			// 新規リレーションシップID
			relshipList["relsId"] = newRSID;
			// 親アイテムのconfig_id
			relshipList["parentId"] = item.data("configId");
			addRSItemList[newID] = relshipList;
			actionItemList[newID] = "add";
		}

		//-------------------
		// アイテムの構成要素取得
		//-------------------
		function getItemStructureWithId(id)
		{
			// リクエスト情報作成
			var methodAML =
				"<Item " +
				" type='" + window.dialogArguments.parent.getType() + "' " +
				" id='" + id + "' " +
				" mode='add' " +
				" action='GetItemTreeStructure' " +
				" levels='-1' />";
			
			//Arasのツリーデータ取得処理呼び出し
			var res = arasObj.applyMethod("GetItemTreeGridStructure", methodAML);

			//データが取得できた場合、XMLデータからJsonのデータを抜き出す
			if(res)
			{
				var xDoc = arasObj.createXMLDocument();
				xDoc.loadXML(res);
				return xDoc.selectSingleNode("Result/Json").text;
			}
		}
