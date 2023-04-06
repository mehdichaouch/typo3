/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import $ from"jquery";import SortableTable from"@typo3/backend/sortable-table.js";import DocumentSaveActions from"@typo3/backend/document-save-actions.js";import RegularEvent from"@typo3/core/event/regular-event.js";import Modal from"@typo3/backend/modal.js";import Icons from"@typo3/backend/icons.js";import{MessageUtility}from"@typo3/backend/utility/message-utility.js";import PersistentStorage from"@typo3/backend/storage/persistent.js";import DateTimePicker from"@typo3/backend/date-time-picker.js";import{MultiRecordSelectionSelectors}from"@typo3/backend/multi-record-selection.js";import Severity from"@typo3/backend/severity.js";class Scheduler{constructor(){this.initializeEvents(),this.initializeDefaultStates(),this.initializeCloseConfirm(),DocumentSaveActions.getInstance().addPreSubmitCallback((()=>{let e=$("#task_class").val();e=e.toLowerCase().replace(/\\/g,"-"),$(".extraFields").appendTo($("#extraFieldsHidden")),$(".extra_fields_"+e).appendTo($("#extraFieldsSection"))}))}static updateElementBrowserTriggers(){document.querySelectorAll(".t3js-element-browser").forEach((e=>{const t=document.getElementById(e.dataset.triggerFor);e.dataset.params=t.name+"|||pages"}))}static resolveDefaultNumberOfDays(){const e=document.getElementById("task_tableGarbageCollection_numberOfDays");return null===e||void 0===e.dataset.defaultNumberOfDays?null:JSON.parse(e.dataset.defaultNumberOfDays)}static storeCollapseState(e,t){let a={};PersistentStorage.isset("moduleData.scheduler_manage")&&(a=PersistentStorage.get("moduleData.scheduler_manage"));const n={};n[e]=t?1:0,$.extend(a,n),PersistentStorage.set("moduleData.scheduler_manage",a)}actOnChangedTaskClass(e){let t=e.val();t=t.toLowerCase().replace(/\\/g,"-"),$(".extraFields").hide(),$(".extra_fields_"+t).show()}actOnChangedTaskType(e){this.toggleFieldsByTaskType($(e.currentTarget).val())}actOnChangeSchedulerTableGarbageCollectionAllTables(e){const t=$("#task_tableGarbageCollection_numberOfDays"),a=$("#task_tableGarbageCollection_table");if(e.prop("checked"))a.prop("disabled",!0),t.prop("disabled",!0);else{let e=parseInt(t.val(),10);if(e<1){const t=a.val(),n=Scheduler.resolveDefaultNumberOfDays();null!==n&&(e=n[t])}a.prop("disabled",!1),e>0&&t.prop("disabled",!1)}}actOnChangeSchedulerTableGarbageCollectionTable(e){const t=$("#task_tableGarbageCollection_numberOfDays"),a=Scheduler.resolveDefaultNumberOfDays();null!==a&&a[e.val()]>0?(t.prop("disabled",!1),t.val(a[e.val()])):(t.prop("disabled",!0),t.val(0))}toggleFieldsByTaskType(e){e=parseInt(e+"",10),$("#task_end_col").toggle(2===e),$("#task_frequency_row").toggle(2===e)}initializeEvents(){$("#task_class").on("change",(e=>{this.actOnChangedTaskClass($(e.currentTarget))})),$("#task_type").on("change",this.actOnChangedTaskType.bind(this)),$("#task_tableGarbageCollection_allTables").on("change",(e=>{this.actOnChangeSchedulerTableGarbageCollectionAllTables($(e.currentTarget))})),$("#task_tableGarbageCollection_table").on("change",(e=>{this.actOnChangeSchedulerTableGarbageCollectionTable($(e.currentTarget))})),$("[data-update-task-frequency]").on("change",(e=>{const t=$(e.currentTarget);$("#task_frequency").val(t.val()),t.val(t.attr("value")).trigger("blur")})),document.querySelectorAll("[data-scheduler-table]").forEach((e=>{new SortableTable(e)})),document.querySelectorAll("#tx_scheduler_form .t3js-datetimepicker").forEach((e=>DateTimePicker.initialize(e))),$(document).on("click",".t3js-element-browser",(e=>{e.preventDefault();const t=e.currentTarget;Modal.advanced({type:Modal.types.iframe,content:t.href+"&mode="+t.dataset.mode+"&bparams="+t.dataset.params,size:Modal.sizes.large})})),new RegularEvent("show.bs.collapse",this.toggleCollapseIcon.bind(this)).bindTo(document),new RegularEvent("hide.bs.collapse",this.toggleCollapseIcon.bind(this)).bindTo(document),new RegularEvent("multiRecordSelection:action:go",this.executeTasks.bind(this)).bindTo(document),new RegularEvent("multiRecordSelection:action:go_cron",this.executeTasks.bind(this)).bindTo(document),window.addEventListener("message",this.listenOnElementBrowser.bind(this))}initializeDefaultStates(){const e=$("#task_type");e.length&&this.toggleFieldsByTaskType(e.val());const t=$("#task_class");t.length&&(this.actOnChangedTaskClass(t),Scheduler.updateElementBrowserTriggers())}listenOnElementBrowser(e){if(!MessageUtility.verifyOrigin(e.origin))throw"Denied message sent by "+e.origin;if("typo3:elementBrowser:elementAdded"===e.data.actionName){if(void 0===e.data.fieldName)throw"fieldName not defined in message";if(void 0===e.data.value)throw"value not defined in message";document.querySelector('input[name="'+e.data.fieldName+'"]').value=e.data.value.split("_").pop()}}toggleCollapseIcon(e){const t="hide.bs.collapse"===e.type,a=document.querySelector('.t3js-toggle-table[data-bs-target="#'+e.target.id+'"] .collapseIcon');null!==a&&Icons.getIcon(t?"actions-view-list-expand":"actions-view-list-collapse",Icons.sizes.small).then((e=>{a.innerHTML=e})),Scheduler.storeCollapseState($(e.target).data("table"),t)}executeTasks(e){const t=document.querySelector("#tx_scheduler_form");if(null===t)return;const a=[];if(e.detail.checkboxes.forEach((e=>{const t=e.closest(MultiRecordSelectionSelectors.elementSelector);null!==t&&t.dataset.taskId&&a.push(t.dataset.taskId)})),a.length){if("multiRecordSelection:action:go_cron"===e.type){const e=document.createElement("input");e.setAttribute("type","hidden"),e.setAttribute("name","scheduleCron"),e.setAttribute("value",a.join(",")),t.append(e)}else{const e=document.createElement("input");e.setAttribute("type","hidden"),e.setAttribute("name","execute"),e.setAttribute("value",a.join(",")),t.append(e)}t.submit()}}initializeCloseConfirm(){const e=document.querySelector("form[name=tx_scheduler_form]");if(!e)return;const t=new FormData(e);document.querySelector(".t3js-scheduler-close").addEventListener("click",(a=>{const n=new FormData(e),s=Object.fromEntries(t.entries()),l=Object.fromEntries(n.entries());if(JSON.stringify(s)!==JSON.stringify(l)||e.querySelector('input[value="add"]')){a.preventDefault();const t=a.target.href;Modal.confirm(TYPO3.lang["label.confirm.close_without_save.title"]||"Do you want to close without saving?",TYPO3.lang["label.confirm.close_without_save.content"]||"You currently have unsaved changes. Are you sure you want to discard these changes?",Severity.warning,[{text:TYPO3.lang["buttons.confirm.close_without_save.no"]||"No, I will continue editing",btnClass:"btn-default",name:"no",trigger:()=>Modal.dismiss()},{text:TYPO3.lang["buttons.confirm.close_without_save.yes"]||"Yes, discard my changes",btnClass:"btn-default",name:"yes",trigger:()=>{Modal.dismiss(),window.location.href=t}},{text:TYPO3.lang["buttons.confirm.save_and_close"]||"Save and close",btnClass:"btn-primary",name:"save",active:!0,trigger:()=>{Modal.dismiss();const t=document.createElement("input");t.type="hidden",t.value="saveclose",t.name="CMD",e.append(t),e.submit()}}])}}))}}export default new Scheduler;