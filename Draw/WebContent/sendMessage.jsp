<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ page contentType="text/event-stream; charset=UTF-8"%>
<%
response.setHeader("Cache-Control", "no-cache");
String s = "{\"id\":1,\"temp\":"+ String.format("%.2f", Math.random()*30+70) +",\"press\":"+String.format("%.2f", Math.random()*10+40)+",\"stationTemp\":"+String.format("%.2f", Math.random()*10+80)+"}";
out.print("data:" + s+"\n\n" );
out.flush();
%>