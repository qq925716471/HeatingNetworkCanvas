package com.zhang.action;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.ServletActionContext;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.opensymphony.xwork2.ActionSupport;


public class BussinessAction extends ActionSupport {
	/**
	 * TODO serialVersionUID
	 */

	private static final long serialVersionUID = -7536546482323952608L;

	public void sendMessage() throws IOException{
		HttpServletResponse response= ServletActionContext.getResponse();
		String contentType = "text/event-stream";
		response.setContentType(contentType);
		response.setHeader("Cache-Control","no-cache");//
		// 利用输出输入流导出文件
		ServletOutputStream sos = response.getOutputStream();
		String s = "data:{\"temp\":"+ String.format("%.2f", Math.random()*10+90) +",\"press\":"+String.format("%.2f", Math.random()*10+40)+",\"stationTemp\":"+String.format("%.2f", Math.random()*10+80)+"}";
		sos.write(s.getBytes("UTF-8"));
		sos.flush();
		sos.close();
	}
	
	public String savePicture() throws IOException{
	    String path = ServletActionContext.getServletContext().getRealPath("/")+"draw/"+stationName+".text";
	    File file = new File(path);
	    if(!file.exists()){
	        file.createNewFile();//不存在则创建
	       }
	    FileWriter fw = new FileWriter(file);
	    lines = lines==null?"[]":lines;
	    icons = icons==null?"[]":icons;
	    texts = texts==null?"[]":texts;
	    fw.write("{lines:"+lines+",icons:"+icons+",texts:"+texts+"}");
	    fw.flush();
	    fw.close();
	    fw = null;
		json = new JSONArray();
		return "MYJSON";
	}
	
	public String getPicture() throws IOException{
	    String path = ServletActionContext.getServletContext().getRealPath("/")+"draw/"+stationName+".text";
	    File f = new File(path);
		@SuppressWarnings("resource")
		FileReader fr = new FileReader(f);
		char[] str = new char[(int)f.length()];
		fr.read(str);
		String string = new String(str);
		JSONObject myjson = JSONObject.fromObject(string);
		json = new JSONArray().element(myjson);
		return "MYJSON";
	}
	
	JSONArray json;
	Map<String, String> map;
	String lines,icons,texts,stationName;
	public String getStationName() {
		return stationName;
	}

	public void setStationName(String stationName) {
		this.stationName = stationName;
	}

	
	public String getLines() {
		return lines;
	}

	public void setLines(String lines) {
		this.lines = lines;
	}

	public String getIcons() {
		return icons;
	}

	public void setIcons(String icons) {
		this.icons = icons;
	}

	public void setTexts(String texts) {
		this.texts = texts;
	}

	public Map<String, String> getMap() {
		return map;
	}

	public void setMap(Map<String, String> map) {
		this.map = map;
	}

	public JSONArray getJson() {
		return json;
	}

	public void setJson(JSONArray json) {
		this.json = json;
	}
}
