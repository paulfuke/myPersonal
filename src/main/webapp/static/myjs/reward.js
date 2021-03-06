layui.use(['form','layer','laydate','table','laytpl'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laydate = layui.laydate,
        laytpl = layui.laytpl,
        table = layui.table;
    //奖惩
    var tableIns = table.render({
        elem: '#stuList',
        url : '/reward/pageList',
        cellMinWidth : 95,
        page : true,
        height : "full-125",
        limit : 10,
        limits : [5,10,15,20],
        id : "stuListTable",
        cols : [[
            {type: "checkbox", fixed:"left", width:50},
            {title:'序号',filed:'', fixed:"left", type:'numbers', width:80},
            {field: 'employee', title: '员工姓名', align:'center',templet:function(d){
                    if(d.employee){
                        return d.employee.empName;
                    }else{
                        return "暂未关联";
                    }
                }},
            {field: 'status', title: '奖励/惩罚', width:200, align:"center",templet:function (d) {
                    if(d.status){
                        return "奖励";
                    }else{
                        return "惩罚";
                    }
                }},
            {field: 'reMoney', title: '金额', width:200, align:"center"},
            {field: 'reDesc', title: '原因', width:350},
            {field: 'reDate', title: '奖惩日期', width:150},
            {title: '操作', width:170, templet:'#newsListBar',fixed:"right",align:"center"}
        ]]
    });

    //是否置顶
    form.on('switch(newsTop)', function(data){
        var index = layer.msg('修改中，请稍候',{icon: 16,time:false,shade:0.8});
        setTimeout(function(){
            layer.close(index);
            if(data.elem.checked){
                layer.msg("置顶成功！");
            }else{
                layer.msg("取消置顶成功！");
            }
        },500);
    });

    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        if($(".searchVal").val() != ''){
            table.reload("stuListTable",{
                page: {
                    curr: 1 //重新从第 1 页开始
                },
                where: {
                    key: $(".searchVal").val()  //搜索的关键字
                }
            })
        }else{
            layer.msg("请输入搜索的内容");
        }
    });
    laydate.render({
        elem:'#reDate'
    });
    var addDialog = null;
    $(".addNews_btn").click(function(){
        $('#addForm')[0].reset();
        $('#reId').val('');
        layui.form.render();
        addReward("添加奖惩");
    });
    function addReward(title){
        addDialog = layui.layer.open({
            title:title,
            type:1,
            content:$('#addReward'),
            area:["500px","400px"],
            btn:['提交','重置'],
            yes:function (index,layer) {
                var data = form.val("addForm");
                var url;
                console.log(data);
                if(data.reId != null && data.reId !==''){
                    url = '/reward/update'
                }else{
                    url =  '/reward/add'
                }
                $.post(url,data,function (res) {
                    layui.layer.msg(res.msg);
                    if(res.success){
                        tableIns.reload();
                        layui.layer.close(addDialog);
                    }
                });
            },
            btn2:function (index,layer) {
                $('#addForm')[0].reset();
                return false;
            }
        });


    }

    //批量删除
    $(".delAll_btn").click(function(){
        var checkStatus = table.checkStatus('stuListTable'),
            data = checkStatus.data,
            reIds = [];
        if(data.length > 0) {
            for (var i in data) {
                reIds.push(data[i].reId);
            }

            layer.confirm('确定删除选中的奖惩？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url:'/reward/deleteAll',
                    type:'post',
                    data:{reIds:reIds},
                    traditional:true,
                    success:function (data) {
                        layer.close(index);
                        layer.msg(data.msg);
                        if(data.success){
                            tableIns.reload();
                        }
                    }
                });
            })
        }else{
            layer.msg("请选择需要删除的奖惩");
        }
    });

    //列表操作
    table.on('tool(stuList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;
        if(layEvent === 'edit'){ //编辑
            addReward("编辑奖惩");
            console.log(obj.data);
            //回显员工编号
            $('#empId').val(data.employee.empId);
            form.val("addForm",obj.data);
        } else if(layEvent === 'del'){ //删除
            layer.confirm('确定删除此奖惩？',{icon:3, title:'提示信息'},function(index){
                $.post("/reward/delete",{
                    reId : data.reId  //将需要删除的newsId作为参数传入
                },function(data){
                    if(data.success){
                        layer.msg(data.msg);
                        tableIns.reload();
                        layer.close(index);
                    }else{
                        layer.msg(data.msg);
                    }
                })
            });
        }
    });

});