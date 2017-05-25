/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50624
 Source Host           : localhost
 Source Database       : myblog4

 Target Server Type    : MySQL
 Target Server Version : 50624
 File Encoding         : utf-8

 Date: 12/16/2016 22:23:52 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `t_blog`
-- ----------------------------
DROP TABLE IF EXISTS `t_blog`;
CREATE TABLE `t_blog` (
  `blog_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `author` int(11) DEFAULT NULL,
  PRIMARY KEY (`blog_id`),
  KEY `user_id` (`author`),
  CONSTRAINT `user_blog_fk` FOREIGN KEY (`author`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `t_blog`
-- ----------------------------
BEGIN;
INSERT INTO `t_blog` VALUES ('1', '标题1', '瞄瞄', '2016-12-16 11:16:56', '1'), ('2', '标题2', 'hehe', '2016-12-12 11:42:12', '1'), ('3', '标题3', 'hoho', '2016-12-16 11:42:39', '3');
COMMIT;

-- ----------------------------
--  Table structure for `t_comment`
-- ----------------------------
DROP TABLE IF EXISTS `t_comment`;
CREATE TABLE `t_comment` (
  `comm_id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `blog_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`comm_id`),
  KEY `blog_id` (`blog_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `blog_comment_fk` FOREIGN KEY (`blog_id`) REFERENCES `t_blog` (`blog_id`),
  CONSTRAINT `user_comment_fk` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `t_comment`
-- ----------------------------
BEGIN;
INSERT INTO `t_comment` VALUES ('1', 'hhhhh', '2016-12-16 14:46:30', '1', '1'), ('2', 'gggg', '2016-12-16 14:46:43', '1', '3'), ('3', 'rrrr', '2016-12-16 15:18:49', '2', '4');
COMMIT;

-- ----------------------------
--  Table structure for `t_user`
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `create_time` date DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `t_user`
-- ----------------------------
BEGIN;
INSERT INTO `t_user` VALUES ('1', 'lisi', '1234', '12345678', 'lisi@163.com', '2016-12-21'), ('3', 'zhaoliu', 'admin', '888888', 'zhaoliu@qq.com', '2016-12-10'), ('4', 'tianqi', '1234', '99999', 'tianqi@126.com', '2016-12-13');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
