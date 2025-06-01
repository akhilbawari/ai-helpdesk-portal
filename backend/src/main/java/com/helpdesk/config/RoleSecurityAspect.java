package com.helpdesk.config;

import com.helpdesk.model.Profile;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * Aspect to handle role-based security using the @RequireRole annotation.
 */
@Aspect
@Component
public class RoleSecurityAspect {

    /**
     * Intercepts method calls with @RequireRole annotation and checks if the current user has the required role.
     *
     * @param joinPoint The intercepted method call
     * @return The result of the method call if access is granted
     * @throws Throwable If access is denied or if the method throws an exception
     */
    @Around("@annotation(com.helpdesk.config.RequireRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint) throws Throwable {
        // Get the method signature
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // Get the required roles from the annotation
        RequireRole requireRole = method.getAnnotation(RequireRole.class);
        String[] requiredRoles = requireRole.value();
        
        // Get the current user's authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Profile.Role userRole = userDetails.getProfile().getRole();
            
            // Check if the user's role is in the required roles
            boolean hasRequiredRole = Arrays.stream(requiredRoles)
                    .anyMatch(role -> role.equals(userRole.name()));
            
            if (hasRequiredRole) {
                // User has the required role, proceed with the method call
                return joinPoint.proceed();
            }
        }
        
        // User does not have the required role, throw an exception
        throw new AccessDeniedException("Access denied. Required role: " + Arrays.toString(requiredRoles));
    }
}
