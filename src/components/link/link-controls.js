

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { RichUtils, EditorState } from 'draft-js';
import Icon from '../icons';
import Button from '../button';
import LinkModal from './link-modal';
import { linkFilter } from '../decorator/link';
import { prefixCls } from '../../config';


class LinkControls extends React.Component {

  static propsTypes = {
    onToggle: PropTypes.func.isRequired,
    editorState: PropTypes.instanceOf( EditorState ).isRequired
  };

  handleToggle = ( values ) => {

    const { editorState } = this.props;

    if ( values ) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity( 'link', 'MUTABLE', {
        url: values.http + values.url, target: values.target
      });
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set( editorState, { currentContent: contentStateWithEntity });
      this.props.onToggle(
        RichUtils.toggleLink( newEditorState, newEditorState.getSelection(), entityKey )
      );
      this.toggleLinkOption( false );
    } else {
      this.props.onToggle(
        RichUtils.toggleLink( editorState, editorState.getSelection(), null )
      );
    }
  };

  // 添加链接
  handleOk = ( values ) => {
    this.handleToggle( values );
  };

  // 取消
  handleCancel = () => {
    this.toggleLinkOption( false );
  };

  // 弹出链接弹出层
  addLink = () => {
    this.toggleLinkOption( true );
  };

  // 删除链接
  removeLink = () => {
    this.handleToggle();
  };

  // 开关弹出层
  toggleLinkOption = ( open ) => {
    open ? this.openModal() : this.closeModal();
  };

  hasLink() {

    let hasLink = false;

    const { editorState } = this.props;
    const selection = editorState.getSelection();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const contentState = editorState.getCurrentContent();
    const contentBlock = contentState.getBlockForKey( selection.getAnchorKey());

    // 寻找实体 LINK， 非异步回调
    contentBlock.findEntityRanges( linkFilter( contentState ), ( start, end ) => {
      if ( startOffset < end && endOffset > start ) {
        hasLink = true;
      }
    });

    return hasLink;
  }

  isNotCollapsed = () => {
    const selection = this.props.editorState.getSelection();
    return !selection.isCollapsed() && selection.getHasFocus();
  };

  openModal = () => {

    if ( !this.container ) {
      this.container = document.createElement( 'div' );
      document.body.appendChild( this.container );
    }

    ReactDOM.render(
      <LinkModal
        onOk={this.handleOk}
        onCancel={this.handleCancel} />,
      this.container
    );
  };

  closeModal = () => {
    if ( this.container ) {
      ReactDOM.unmountComponentAtNode( this.container );
      document.body.removeChild( this.container );
      this.container = null;
    }
  };

  render() {

    return (
      <div className={`${prefixCls}-toolbar`}>
        <Button
          id="add"
          title="添加链接"
          onToggle={this.addLink}
          disabled={!this.isNotCollapsed()}
          label={<Icon type="link" />} />
        <Button
          id="remove"
          title="删除链接"
          label={<Icon type="unlink" />}
          onToggle={this.removeLink}
          disabled={!( this.isNotCollapsed() && this.hasLink())} />
      </div>
    );
  }
}


export default LinkControls;

